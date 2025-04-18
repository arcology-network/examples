// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;
pragma abicoder v2;

import "../SwapCallDataArray.sol";
import "@arcologynetwork/concurrentlib/lib/map/HashU256Cum.sol";
import "../PoolDatasMap.sol";

interface ISwapLogic {
    // function swapNetting(SwapCallDataArray listMin,SwapCallDataArray listMax,address pooladr,uint256 amountMinCounterPart,uint160 sqrtPriceX96) external;

    function findMax(address pooladr,PoolDataMap pools,HashU256Map swapDataSum) external 
        returns(bool canswap,uint256 amountMinCounterPart,bytes32 keyMin,bytes32 keyMax);

    // function swapWithPools(SwapCallDataArray listMin,SwapCallDataArray listMax) external ;

    function depositSingle(address tokenIn,address sender,uint256 amountIn) external;

    function swap(bool canswap,SwapCallDataArray listMin,SwapCallDataArray listMax,address pooladr,uint256 amountMinCounterPart) external;

    function GetPid()external returns (bytes32 pid);
    // function parseParams(address factory,bytes memory data) external returns(bytes32,address,address,uint24,address,bytes32);
}