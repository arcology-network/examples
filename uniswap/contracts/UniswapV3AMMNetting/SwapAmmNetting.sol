// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;
pragma abicoder v2;
import '../UniswapV3Periphery/libraries/Path.sol';
import "@arcologynetwork/concurrentlib/lib/runtime/Runtime.sol";
import "@arcologynetwork/concurrentlib/lib/array/U256.sol";
import "@arcologynetwork/concurrentlib/lib/map/HashU256Cum.sol";
// import "@arcologynetwork/concurrentlib/lib/map/AddressU256Cum.sol";
import "@arcologynetwork/concurrentlib/lib/multiprocess/Multiprocess.sol";
import "./interfaces/ISwapLogic.sol";
import "./libraries/PoolLibary.sol";
import "./SwapCallDataArray.sol";



/// @title Uniswap V3 Swap Router
/// @notice Router for stateless execution of swaps against Uniswap V3
contract SwapAmmNetting 
{
    using Path for bytes;

    address private factory;
    address private  swapLogic;
    event WriteBackEvent(bytes32 indexed pid,bytes32 indexed eventSigner,bytes eventContext);
    U256 private flags ;
    
    PoolDataMap private pools ;
    Multiprocess mp = new Multiprocess(10);
    mapping (bytes32 => SwapCallDataArray) private swapDataMap;
    HashU256Map private swapDataSum ;
    
    uint256 poolSize;
    
    
    bytes4 constant funcSign=0xc6678321;  //bytes4(keccak256(bytes("exactInputSingleDefer((address,address,uint24,address,uint256,uint256,uint256,uint160))")));

    constructor() {  
        Runtime.defer(funcSign);
    }
    
    function init(address _factory,address _swapLogic) external {
        factory=_factory;
        swapLogic=_swapLogic;
        flags = new U256();
        pools = new PoolDataMap();
        swapDataSum= new HashU256Map();
    }

    function initPool(
        address pool,
        address tokenA,
        address tokenB
    ) external {
        pools.set(pool, tokenA, tokenB);
        initEnvs(pool,tokenA);
        initEnvs(pool,tokenB);
        poolSize++;
    }

    function initEnvs(address pool,address token)internal{
        swapDataMap[PoolLibary.GetKey(pool,token)]=new SwapCallDataArray();
    }
    
    
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }

    function exactInputSingleDefer(ExactInputSingleParams calldata params) 
        external 
        payable 
        returns (uint256 amountOut)
    {
        bytes32 pid=abi.decode(Runtime.pid(), (bytes32));
        address pooladr=PoolLibary.computePoolAdr(factory, params.tokenIn, params.tokenOut, params.fee);
        bytes32 keyIn=PoolLibary.GetKey(pooladr,params.tokenIn);

        swapDataMap[keyIn].push(pid,abi.encodePacked(params.tokenIn, params.fee, params.tokenOut),msg.sender,params.recipient,params.amountIn,params.sqrtPriceLimitX96,pooladr);
        swapDataSum.set(keyIn, params.amountIn, 0, type(uint256).max);
        ISwapLogic(swapLogic).depositSingle(params.tokenIn,msg.sender,params.amountIn);
        flags.push(1);

        if(flags.committedLength()>0){
            
            for(uint i=0;i<poolSize;i++){  
                mp.addJob(1000000000, address(this), abi.encodeWithSignature("poolProcess(address)", pools.keyAt(i)));
            }
            mp.run();
        
            flags.clear();
            mp.clear();
        }
        // emit Step(2000);
        amountOut=0;
    }

    event Step(uint256 _step);

    function poolProcess(address pooladr) public {
        (bool canswap,uint256 amountMinCounterPart,bytes32 keyMin,bytes32 keyMax)=ISwapLogic(swapLogic).findMax(pooladr, pools, swapDataSum);
        SwapCallDataArray listMin = swapDataMap[keyMin];
        SwapCallDataArray listMax = swapDataMap[keyMax];
        if(listMin.fullLength()==0 && listMax.fullLength()==0) return;
        ISwapLogic(swapLogic).swap(canswap, listMin, listMax, pooladr, amountMinCounterPart);
        //clear pool environments
        clearEnvs(keyMin);
        clearEnvs(keyMax);
    }

    function clearEnvs(bytes32 key)internal{
        swapDataMap[key].clear();
        swapDataSum.set(key, -int256(swapDataSum.get(key)));
    }
}
