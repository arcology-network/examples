// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;
pragma abicoder v2;

import '../UniswapV3Periphery/libraries/Path.sol';
import "@arcologynetwork/concurrentlib/lib/runtime/Runtime.sol";
import "@arcologynetwork/concurrentlib/lib/array/U256.sol";
import "@arcologynetwork/concurrentlib/lib/map/HashU256Cum.sol";
import "@arcologynetwork/concurrentlib/lib/map/AddressU256Cum.sol";

import "./interfaces/ISwapLogic.sol";
import "./interfaces/IPoolFactory.sol";

import "./libraries/PoolLibary.sol";
import "./libraries/PriceLibary.sol";

import "./SwapCallDataArray.sol";



/// @title Uniswap V3 Swap Router
/// @notice Router for stateless execution of swaps against Uniswap V3
contract SwapAmmNetting 
{
    using Path for bytes;

    address private factory;
    address private  swapLogic;
    event PoolCreated(address indexed token0,address indexed token1,uint24 indexed fee,int24 tickSpacing,address pool);
    event WriteBackEvent(bytes32 indexed pid,bytes32 indexed eventSigner,bytes eventContext);
    U256 private flags ;
    
    PoolDataMap private pools ;

    mapping (bytes32 => SwapCallDataArray) private swapDataMap;
    HashU256Map private swapDataSum ;
    AddressU256Map private curPools ;
    
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
        curPools=new AddressU256Map();
    }

    function initPool(
        address tokenA,
        address tokenB,
        uint24 fee
    ) external returns (address pool){
        pool=PoolLibary.computePoolAdr(factory, tokenA, tokenB, fee);
        emit createPoolInited(pool);
        pools.set(pool, tokenA, tokenB);
        curPools.insert(pool, 0, 0, type(uint256).max);

        initEnvs(pool,tokenA);
        initEnvs(pool,tokenB);
    }
    event createPoolInited(address pooladr);

    function initEnvs(address pool,address token)internal{
        bytes32 key=PoolLibary.GetKey(pool,token);
        swapDataMap[key]=new SwapCallDataArray();
        swapDataSum.insert(key, 0, 0, type(uint256).max);
    }

    function parallelProcess(uint256 amountIn,address recipient,uint160 sqrtPriceLimitX96,bytes memory data) internal {
        bytes32 pid=abi.decode(Runtime.pid(), (bytes32));
        (address tokenIn, address tokenOut, uint24 fee) = data.decodeFirstPool();
        address pooladr=PoolLibary.computePoolAdr(factory, tokenIn, tokenOut, fee);
        bytes32 keyIn=PoolLibary.GetKey(pooladr,tokenIn);
        
        swapDataMap[keyIn].push(pid,data,msg.sender,recipient,amountIn,sqrtPriceLimitX96,pooladr);
        swapDataSum.set(keyIn, int256(amountIn));
        curPools.set(pooladr, int256(1));
        flags.push(1);
    }


    function dererProcess() internal {
        uint256 poolSize = curPools.fullLength();
        uint256 curpoolVal;
        address pooladr;
        for(uint i=0;i<poolSize;i++){         
            curpoolVal=curPools.valueAt(i);
            if(curpoolVal==0) continue;
            
            pooladr = curPools.keyAt(i);
            (bool canswap,uint256 amountMinCounterPart,bytes32 keyMin,bytes32 keyMax)=ISwapLogic(swapLogic).findMax(pooladr, pools, swapDataSum);
            if(canswap){
                ISwapLogic(swapLogic).swapProcess(swapDataMap[keyMin],swapDataMap[keyMax],pooladr,amountMinCounterPart,PriceLibary.getSqrtPricex96(pooladr));
            }else{
                ISwapLogic(swapLogic).swapWithPools(swapDataMap[keyMin],swapDataMap[keyMax]);
            }

            //clear pool environments
            curPools.set(pooladr, -int256(curpoolVal));
            clearEnvs(keyMin);
            clearEnvs(keyMax);
        }
    }

    function clearEnvs(bytes32 key)internal{
        swapDataMap[key].clear();
        swapDataSum.set(key, -int256(swapDataSum.get(key)));
    }
    
    event Step(uint256 _step);
    event StepAdr(address _step);
    
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
        parallelProcess(
            params.amountIn,
            params.recipient,
            params.sqrtPriceLimitX96,
            abi.encodePacked(params.tokenIn, params.fee, params.tokenOut)
        );
        
        if(flags.committedLength()>0){
            dererProcess();
            flags.clear();
        }
        emit Step(2000);
        amountOut=0;
    }
}
