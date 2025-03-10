// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;
pragma abicoder v2;

import '@uniswap/v3-core/contracts/libraries/SafeCast.sol';
import '@uniswap/v3-core/contracts/libraries/TickMath.sol';
import '@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol';
import "@uniswap/v3-core/contracts/interfaces/pool/IUniswapV3PoolEvents.sol";

import './interfaces/ISwapRouter.sol';
import './base/PeripheryImmutableState.sol';
import './base/PeripheryValidation.sol';
import './base/PeripheryPaymentsWithFee.sol';
import './base/Multicall.sol';
import './base/SelfPermit.sol';
import './libraries/Path.sol';
import './libraries/PoolAddress.sol';
import './libraries/CallbackValidation.sol';
import './interfaces/external/IWETH9.sol';

import "@arcologynetwork/concurrentlib/lib/runtime/Runtime.sol";
import "./libraries/PriceLibary.sol";
import "./SwapCallDataArray.sol";
import "./libraries/TransferHelper.sol";
import "@arcologynetwork/concurrentlib/lib/commutative/U256Cum.sol";
import "./PoolDatas.sol";
import "@arcologynetwork/concurrentlib/lib/array/U256.sol";

/// @title Uniswap V3 Swap Router
/// @notice Router for stateless execution of swaps against Uniswap V3
contract SwapRouter is
    ISwapRouter,
    PeripheryImmutableState,
    PeripheryValidation,
    PeripheryPaymentsWithFee,
    Multicall,
    SelfPermit
{
    using Path for bytes;
    using SafeCast for uint256;

    U256 flags = new U256();
    SwapCallDataArray swapDatas=new SwapCallDataArray();
    mapping (bytes => uint[]) private swapDataGroup;
    mapping (bytes => uint256) private amountInSum;
    PoolDatas pools = new PoolDatas();
    mapping (address => bool) private poolMp;

    bytes32 constant eventSigner=keccak256(bytes("Swap(address,address,int256,int256,uint160,uint128,int24)"));    
    event WriteBackEvent(bytes32 indexed pid,bytes32 indexed eventSigner,bytes eventContext);
    bytes32 internal constant INDEXED_SPLITE = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;

    /// @dev Used as the placeholder value for amountInCached, because the computed amount in for an exact output swap
    /// can never actually be this value
    uint256 private constant DEFAULT_AMOUNT_IN_CACHED = type(uint256).max;

    /// @dev Transient storage variable used for returning the computed amount in for an exact output swap.
    uint256 private amountInCached = DEFAULT_AMOUNT_IN_CACHED;

    constructor(address _factory, address _WETH9) PeripheryImmutableState(_factory, _WETH9) {
        Runtime.defer(bytes4(keccak256(bytes("exactInputSingleDefer((address,address,uint24,address,uint256,uint256,uint256,uint160))"))));
    }


    /// @dev Returns the pool for the given token pair and fee. The pool contract may or may not exist.
    function getPool(
        address tokenA,
        address tokenB,
        uint24 fee
    ) private view returns (IUniswapV3Pool) {
        return IUniswapV3Pool(PoolAddress.computeAddress(factory, PoolAddress.getPoolKey(tokenA, tokenB, fee)));
    }

    struct SwapCallbackData {
        bytes path;
        address payer;
    }
    

    /// @inheritdoc IUniswapV3SwapCallback
    function uniswapV3SwapCallback(
        int256 amount0Delta,
        int256 amount1Delta,
        bytes calldata _data
    ) external override {
        
        require(amount0Delta > 0 || amount1Delta > 0); // swaps entirely within 0-liquidity regions are not supported
        SwapCallbackData memory data = abi.decode(_data, (SwapCallbackData));

        (address tokenIn, address tokenOut, uint24 fee) = data.path.decodeFirstPool();

        CallbackValidation.verifyCallback(factory, tokenIn, tokenOut, fee);

        (bool isExactInput, uint256 amountToPay) =
            amount0Delta > 0
                ? (tokenIn < tokenOut, uint256(amount0Delta))
                : (tokenOut < tokenIn, uint256(amount1Delta));
        
        if (isExactInput) {        
            pay(tokenIn, data.payer, msg.sender, amountToPay);
        } else {            
            // either initiate the next swap or pay
            if (data.path.hasMultiplePools()) {                
                data.path = data.path.skipToken();
                exactOutputInternal(amountToPay, msg.sender, 0, data);
            } else {                
                amountInCached = amountToPay;
                tokenIn = tokenOut; // swap in/out because exact output swaps are reversed
                pay(tokenIn, data.payer, msg.sender, amountToPay);
            }
        }
    }

    /// @dev Performs a single exact input swap
    function exactInputInternal(
        uint256 amountIn,
        address recipient,
        uint160 sqrtPriceLimitX96,
        SwapCallbackData memory data
    ) private returns (uint256 amountOut) {
        // allow swapping to the router address with address 0
        if (recipient == address(0)) recipient = address(this);

        (address tokenIn, address tokenOut, uint24 fee) = data.path.decodeFirstPool();

        bool zeroForOne = tokenIn < tokenOut;

        (int256 amount0, int256 amount1) =
            getPool(tokenIn, tokenOut, fee).swap(
                recipient,
                zeroForOne,
                amountIn.toInt256(),
                sqrtPriceLimitX96 == 0
                    ? (zeroForOne ? TickMath.MIN_SQRT_RATIO + 1 : TickMath.MAX_SQRT_RATIO - 1)
                    : sqrtPriceLimitX96,
                abi.encode(data)
            );

        return uint256(-(zeroForOne ? amount1 : amount0));
    }

    function getPoolAdr(SwapCallbackData memory data) private view returns (address){
        (address tokenIn, address tokenOut, uint24 fee) = data.path.decodeFirstPool();
        return PoolAddress.computeAddress(factory, PoolAddress.getPoolKey(tokenIn, tokenOut, fee));
    }

    function parallelProcess(uint256 amountIn,
        address recipient,
        uint160 sqrtPriceLimitX96,
        SwapCallbackData memory data) internal {


        // if(flags.committedLength()==0){
        //     swapDatas.clear();
        //     pools.clear();
        // }


        (address tokenIn,address tokenOut , ) = data.path.decodeFirstPool();
        bytes32 pid=abi.decode(Runtime.pid(), (bytes32));

        address pooladr=getPoolAdr(data);

        pools.push(pooladr, tokenIn, tokenOut);
        swapDatas.push(pid,data.path,msg.sender,recipient,amountIn,sqrtPriceLimitX96,pooladr);
        flags.push(1);
        

    }

    function findMax(address pooladr,address tokenA,address tokenB) internal returns(address tokenMin,address tokenMax,uint256 amountMinCounterPart){
        uint256 amountA=amountInSum[abi.encodePacked(pooladr,tokenA)];
        uint256 amountAB=PriceLibary.getAmountOut(pooladr, tokenA, tokenB, amountA);
        uint256 amountB=amountInSum[abi.encodePacked(pooladr,tokenB)];

        uint256 amountMin=amountB;
        (tokenMin,tokenMax)=(tokenB,tokenA);
        

        if(amountAB<amountMin){
            amountMin=amountA;
            (tokenMin,tokenMax)=(tokenA,tokenB);
            amountMinCounterPart=amountAB;
        }else{
            amountMinCounterPart=PriceLibary.getAmountOut(pooladr, tokenMin, tokenMax, amountMin);
        }
    }

    function minProcessIn(address pooladr,address tokenMin) internal {
        uint[] memory idxes=swapDataGroup[abi.encodePacked(pooladr,tokenMin)];
        
        for(uint i = 0; i < idxes.length; i++){
            uint idx=idxes[i];
            // if(!swapDatas._exists(idx)) continue;
            (  ,
            
            address  tokenIn,
              ,
              ,
            address sender,
            address  recipient,
            uint256  amountIn,
              ,
            uint256  amountOut
            )=swapDatas.get(idx);
            TransferHelper.safeTransferFrom(tokenIn,sender, address(this), amountIn);
        }
    }
    function minProcessOut(address pooladr,address tokenMin,uint160 sqrtPriceX96) internal {
        uint[] memory idxes=swapDataGroup[abi.encodePacked(pooladr,tokenMin)];
        for(uint i = 0; i < idxes.length; i++){
            uint idx=idxes[i];
            // if(!swapDatas._exists(idx)) continue;
            ( ,
              ,
            address  tokenOut,
              ,
              ,
            address  recipient,
            uint256  amountIn,
              ,
            uint256  amountOut
            )=swapDatas.get(idx);
            TransferHelper.safeTransfer(tokenOut,recipient, amountOut);
            EmitSwapEvent(idx,amountIn,amountOut,sqrtPriceX96);
            swapDatas._del(idx);
        }
    }

    function maxProcessIn(address pooladr,address tokenMax,uint256 amountMinCounterPart) internal {
        uint[] memory idxes=swapDataGroup[abi.encodePacked(pooladr,tokenMax)];
        
        for(uint i = 0; i < idxes.length; i++){
            uint idx=idxes[i];
            // if(!swapDatas._exists(idx)) continue;
            ( ,
            address  tokenIn,
            address  tokenOut,
               ,
            address sender,
            address  recipient,
            uint256  amountIn,
              ,
            uint256  amountOut
            )=swapDatas.get(idx);

            
            if(amountMinCounterPart>=amountIn){
                amountMinCounterPart=amountMinCounterPart-amountIn;
                TransferHelper.safeTransferFrom(tokenIn,sender, address(this), amountIn);
                if(amountMinCounterPart==0){
                    break;
                }
            }else{ //It can be partially redeemed 
                TransferHelper.safeTransferFrom(tokenIn,sender, address(this), amountMinCounterPart);
                break;
            }
        }
    }

    function maxProcessOut(address pooladr,address tokenMax,uint256 amountMinCounterPart,uint160 sqrtPriceX96) internal {
        uint[] memory idxes=swapDataGroup[abi.encodePacked(pooladr,tokenMax)];
        for(uint i = 0; i < idxes.length; i++){
            uint idx=idxes[i];
            // if(!swapDatas._exists(idx)) continue;
            ( ,
            address  tokenIn,
            address  tokenOut,
               ,
             ,
            address  recipient,
            uint256  amountIn,
              ,
            uint256  amountOut
            )=swapDatas.get(idx);

            
            if(amountMinCounterPart>=amountIn){
                amountMinCounterPart=amountMinCounterPart-amountIn;
                TransferHelper.safeTransfer(tokenOut,recipient, amountOut);
                EmitSwapEvent(idx,amountIn,amountOut,sqrtPriceX96);
                swapDatas._del(idx);
            }else{
                uint256 amountPart=PriceLibary.getAmountOut(pooladr, tokenIn, tokenOut, amountMinCounterPart);
                TransferHelper.safeTransfer(tokenOut,recipient, amountPart);
                EmitSwapEvent(idx,amountMinCounterPart,amountPart,sqrtPriceX96);
                swapDatas.update(idx,amountIn-amountMinCounterPart);
                break;
            }
        }
    }
   
    function EmitSwapEvent(uint idx,uint256 amount0,uint256 amount1,uint160 sqrtPriceX96)internal{
        (bytes32 txhash ,
            ,
            ,
            ,
        address sender,
        address  recipient,
            ,
            ,
        
        )=swapDatas.get(idx);
        emit WriteBackEvent(txhash,eventSigner,abi.encode(sender,recipient,INDEXED_SPLITE,amount0,amount1,sqrtPriceX96,0,0));
    }
    
    function swapProcess() internal {
        for(uint i = 0; i < swapDatas.fullLength(); i++){
            if(!swapDatas._exists(i)) continue;

            ( ,
            address  tokenIn,
            address  tokenOut,
            uint24  fee,
            address sender,
            address  recipient,
            uint256  amountIn,
            uint160   sqrtPriceLimitX96,
              
            )=swapDatas.get(i);

            uint256 amountOut=exactInputInternal(
                amountIn,
                recipient,
                sqrtPriceLimitX96,
                SwapCallbackData({path: abi.encodePacked(tokenIn, fee, tokenOut), payer: sender})
            );
            swapDatas._del(i);
        }
        
    }

    function getPools() internal{
        uint256 poolSize=pools.fullLength();
        for(uint i = 0; i < poolSize; i++){
            // if(!pools._exists(i)) continue;
            (address pooladr,,)=pools.get(i);
            if(poolMp[pooladr]){
                pools._del(i);
            }else{
                poolMp[pooladr]=true;
            }
        }
    }

    function  parseCalldata()internal{
        uint256 swapDataSize = swapDatas.fullLength();
        for(uint i = 0; i < swapDataSize; i++){
            // if(!pools._exists(i)) continue;

            (address pooladr,,)=pools.get(i);
            // if(!swapDatas._exists(i)) continue;
   
            (,address tokenIn,,,,,uint256 amountIn,,)=swapDatas.get(i);
    
            bytes memory key=abi.encodePacked(pooladr,tokenIn);

            swapDataGroup[key].push(i);

            amountInSum[key]+=amountIn;            
        }
    }
    
    event Step(uint256 _step);

    function dererProcess() internal {
        if(flags.committedLength()>0){
            
            flags.clear();
            
            parseCalldata();
            
            getPools();
            
            uint256 poolSize = pools.fullLength();
            for(uint i = 0; i < poolSize; i++){
                if(!pools._exists(i)) continue;
                (address pooladr,address tokenA,address tokenB)=pools.get(i);
                (address tokenMin,address tokenMax,uint256 amountMinCounterPart)=findMax(pooladr,tokenA,tokenB);
                uint160 sqrtPriceX96=PriceLibary.getSqrtPricex96(pooladr);
                //min deposit
                minProcessIn(pooladr,tokenMin);
                //max deposit 
                maxProcessIn(pooladr,tokenMax,amountMinCounterPart);
                //min withdraw
                minProcessOut(pooladr,tokenMin,sqrtPriceX96);
                //max withdraw 
                maxProcessOut(pooladr,tokenMax,amountMinCounterPart,sqrtPriceX96);                
            }
            
            // transfer from pool
            swapProcess();
                        
            swapDatas.clear();
            pools.clear();
        }
    } 

    // function exactInputSingleDefer(ExactInputSingleParams calldata params) 
    //     external 
    //     payable 
    //     checkDeadline(params.deadline) 
    //     returns (uint256 amountOut)
    // {

    function exactInputSingleDefer(ExactInputSingleParams calldata params) 
        external 
        payable 
        returns (uint256 amountOut)
    {
        
        parallelProcess(
            params.amountIn,
            params.recipient,
            params.sqrtPriceLimitX96,
            SwapCallbackData({path: abi.encodePacked(params.tokenIn, params.fee, params.tokenOut), payer: msg.sender})
        );
        
        dererProcess();
        amountOut=0;

        
    }



    /// @inheritdoc ISwapRouter
    function exactInputSingle(ExactInputSingleParams calldata params)
        external
        payable
        override
        checkDeadline(params.deadline)
        returns (uint256 amountOut)
    {
        amountOut = exactInputInternal(
            params.amountIn,
            params.recipient,
            params.sqrtPriceLimitX96,
            SwapCallbackData({path: abi.encodePacked(params.tokenIn, params.fee, params.tokenOut), payer: msg.sender})
        );
        require(amountOut >= params.amountOutMinimum, 'Too little received');

    }

    /// @inheritdoc ISwapRouter
    function exactInput(ExactInputParams memory params)
        external
        payable
        override
        checkDeadline(params.deadline)
        returns (uint256 amountOut)
    {
        address payer = msg.sender; // msg.sender pays for the first hop

        while (true) {
            bool hasMultiplePools = params.path.hasMultiplePools();

            // the outputs of prior swaps become the inputs to subsequent ones
            params.amountIn = exactInputInternal(
                params.amountIn,
                hasMultiplePools ? address(this) : params.recipient, // for intermediate swaps, this contract custodies
                0,
                SwapCallbackData({
                    path: params.path.getFirstPool(), // only the first pool in the path is necessary
                    payer: payer
                })
            );

            // decide whether to continue or terminate
            if (hasMultiplePools) {
                payer = address(this); // at this point, the caller has paid
                params.path = params.path.skipToken();
            } else {
                amountOut = params.amountIn;
                break;
            }
        }

        require(amountOut >= params.amountOutMinimum, 'Too little received');
    }

    /// @dev Performs a single exact output swap
    function exactOutputInternal(
        uint256 amountOut,
        address recipient,
        uint160 sqrtPriceLimitX96,
        SwapCallbackData memory data
    ) private returns (uint256 amountIn) {
        // allow swapping to the router address with address 0
        if (recipient == address(0)) recipient = address(this);

        (address tokenOut, address tokenIn, uint24 fee) = data.path.decodeFirstPool();

        bool zeroForOne = tokenIn < tokenOut;

        (int256 amount0Delta, int256 amount1Delta) =
            getPool(tokenIn, tokenOut, fee).swap(
                recipient,
                zeroForOne,
                -amountOut.toInt256(),
                sqrtPriceLimitX96 == 0
                    ? (zeroForOne ? TickMath.MIN_SQRT_RATIO + 1 : TickMath.MAX_SQRT_RATIO - 1)
                    : sqrtPriceLimitX96,
                abi.encode(data)
            );

        uint256 amountOutReceived;
        (amountIn, amountOutReceived) = zeroForOne
            ? (uint256(amount0Delta), uint256(-amount1Delta))
            : (uint256(amount1Delta), uint256(-amount0Delta));
        // it's technically possible to not receive the full output amount,
        // so if no price limit has been specified, require this possibility away
        if (sqrtPriceLimitX96 == 0) require(amountOutReceived == amountOut);
    }

    /// @inheritdoc ISwapRouter
    function exactOutputSingle(ExactOutputSingleParams calldata params)
        external
        payable
        override
        checkDeadline(params.deadline)
        returns (uint256 amountIn)
    {
        // avoid an SLOAD by using the swap return data
        amountIn = exactOutputInternal(
            params.amountOut,
            params.recipient,
            params.sqrtPriceLimitX96,
            SwapCallbackData({path: abi.encodePacked(params.tokenOut, params.fee, params.tokenIn), payer: msg.sender})
        );

        require(amountIn <= params.amountInMaximum, 'Too much requested');
        // has to be reset even though we don't use it in the single hop case
        amountInCached = DEFAULT_AMOUNT_IN_CACHED;
    }

    /// @inheritdoc ISwapRouter
    function exactOutput(ExactOutputParams calldata params)
        external
        payable
        override
        checkDeadline(params.deadline)
        returns (uint256 amountIn)
    {
        // it's okay that the payer is fixed to msg.sender here, as they're only paying for the "final" exact output
        // swap, which happens first, and subsequent swaps are paid for within nested callback frames
        exactOutputInternal(
            params.amountOut,
            params.recipient,
            0,
            SwapCallbackData({path: params.path, payer: msg.sender})
        );

        amountIn = amountInCached;
        require(amountIn <= params.amountInMaximum, 'Too much requested');
        amountInCached = DEFAULT_AMOUNT_IN_CACHED;
    }
}
