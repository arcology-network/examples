// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;
pragma abicoder v2;

import "../SwapCallDataArray.sol";
import "@arcologynetwork/concurrentlib/lib/map/HashU256Cum.sol";
import "../PoolDatasMap.sol";

interface ISwapLogic {
    function swapProcess(
        SwapCallDataArray listMin,
        SwapCallDataArray listMax,
        address pooladr,
        uint256 amountMinCounterPart,
        uint160 sqrtPriceX96
    ) external;

    function findMax(address pooladr,PoolDataMap pools,HashU256Map swapDataSum) external 
        returns(bool canswap,uint256 amountMinCounterPart,bytes32 keyMin,bytes32 keyMax);

    function swapWithPools(SwapCallDataArray listMin,SwapCallDataArray listMax) external ;
}