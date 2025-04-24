// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;
pragma abicoder v2;

import "@arcologynetwork/concurrentlib/lib/shared/Base.sol";
import "@arcologynetwork/concurrentlib/lib/shared/Const.sol";
import '../UniswapV3Periphery/libraries/Path.sol';
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

    constructor() Base(Const.BYTES) {}


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
        (,bytes memory data)=Base._get(idx);
        SwapCallData memory callback=abi.decode(data, (SwapCallData));
        callback.amountIn=amountIn;
        Base._set(idx, abi.encode(callback));
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
        (,bytes memory data)=Base._get(idx);
        SwapCallData memory callback=abi.decode(data, (SwapCallData));
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