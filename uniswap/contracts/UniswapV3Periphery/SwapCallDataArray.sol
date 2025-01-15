// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;
pragma abicoder v2;

import "@arcologynetwork/concurrentlib/lib/base/Base.sol";
import './libraries/Path.sol';
import "./libraries/PriceLibary.sol";

contract SwapCallDataArray is Base{
    using Path for bytes;

    struct SwapCallData {
        bytes32 txhash;
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address sender;
        address recipient;
        uint256 amountIn;
        uint160 sqrtPriceLimitX96;

        uint256 amountOut;
    }

    constructor() Base(Base.BYTES) {}


    function push(bytes32 txhash,
                    bytes memory poolData,
                    address sender,
                    address recipient,
                    uint256 amountIn,
                    uint160 sqrtPriceLimitX96,
                    address pooladr
                    ) public virtual{
        (address tokenIn, address tokenOut, uint24 fee) = poolData.decodeFirstPool();
        SwapCallData memory callback=SwapCallData({
                    txhash: txhash,
                    tokenIn: tokenIn,
                    tokenOut: tokenOut,
                    fee:fee,
                    sender:sender,
                    recipient:recipient,
                    amountIn:amountIn,
                    sqrtPriceLimitX96:sqrtPriceLimitX96,
                    amountOut:PriceLibary.getAmountOut(pooladr, tokenIn, tokenOut, amountIn)
                });
        Base._set(uuid(), abi.encode(callback));
    }    

    function update(uint256 idx,uint256 amountIn) public {
        SwapCallData memory callback=abi.decode(Base._get(idx), (SwapCallData));
        callback.amountIn=amountIn;
        Base._set(idx, abi.encode(callback));
    }
    
    event printE(bytes32 txhash,address tokenA,address tokenB,uint24 fee,address sender,address receipt,uint256 amountIn,uint160 sqrtPrice,uint256 amountOut);
    function print(uint256 idx) public {
        (bytes32 txhash,
        address tokenA,
        address tokenB,
        uint24 fee,
        address sender,
        address receipt,
        uint256 amountIn,
        uint160 sqrtPrice,
        uint256 amountOut) = get(idx);

        emit printE(txhash,tokenA,tokenB,fee,sender,receipt,amountIn,sqrtPrice,amountOut);
    }

    function get(uint256 idx) public virtual returns(
        bytes32,
        address,
        address,
        uint24,
        address,
        address,
        uint256,
        uint160,
        uint256)  {
        SwapCallData memory callback=abi.decode(Base._get(idx), (SwapCallData));
        return (callback.txhash,
                callback.tokenIn,
                callback.tokenOut,
                callback.fee,
                callback.sender,
                callback.recipient,
                callback.amountIn,
                callback.sqrtPriceLimitX96,
                callback.amountOut);
    }
}