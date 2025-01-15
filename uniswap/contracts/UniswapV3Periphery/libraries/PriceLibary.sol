// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.6.0;
import '@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol';
import './Path.sol';


library PriceLibary {
    using Path for bytes;

    uint256 internal constant Q96 = 0x1000000000000000000000000;

    function computePrice(uint256 sqrtPriceX96) internal pure returns (uint256) {
        return (sqrtPriceX96 * sqrtPriceX96) / Q96;
    }

    function getTokenAAmount(uint256 priceX96,uint256 tokenBAmount) internal pure returns (uint256) {
        return (tokenBAmount * Q96) / priceX96;
    }

    function getTokenBAmount(uint256 priceX96,uint256 tokenAAmount) internal pure returns (uint256) {
        return (tokenAAmount * priceX96) / Q96;
    }

    function getSqrtPricex96(address pooladr)internal view returns (uint160) {
        (uint160 sqrtPriceX96,,,,,,) = IUniswapV3Pool(pooladr).slot0();
        return  sqrtPriceX96;
    }

    function getAmountOut(address pooladr,address tokenIn, address tokenOut,uint256 _amountIn) internal view returns (uint256) {
        // (uint160 sqrtPriceX96,,,,,,) = IUniswapV3Pool(pooladr).slot0();
        //compute another amount
        uint256 pricex96=PriceLibary.computePrice(getSqrtPricex96(pooladr));
        
        return  tokenIn < tokenOut ? PriceLibary.getTokenBAmount(pricex96, _amountIn):PriceLibary.getTokenAAmount(pricex96, _amountIn);
    }
}