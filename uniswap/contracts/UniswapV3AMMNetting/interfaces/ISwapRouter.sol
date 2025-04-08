// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;
pragma abicoder v2;


interface ISwapRouter {
    function exactInputExternal(
        uint256 amountIn,
        address recipient,
        uint160 sqrtPriceLimitX96,
        address tokenIn,
        address tokenOut,
        uint24 fee,
        address sender
    ) external payable returns (uint256 amountOut);

    function safeTransferFrom(address token,address from,uint256 value) external;

    function safeTransfer(address token,address to,uint256 value) external;
}