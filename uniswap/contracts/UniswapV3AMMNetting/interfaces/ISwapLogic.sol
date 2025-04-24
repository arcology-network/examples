// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;
pragma abicoder v2;

import "../SwapCallDataArray.sol";
import "../PoolDatasMap.sol";
import "@arcologynetwork/concurrentlib/lib/map/HashU256Cum.sol";



interface ISwapLogic {
    function findMax(address pooladr,PoolDataMap pools,HashU256Map swapDataSum) external 
        returns(bool canswap,uint256 amountMinCounterPart,bytes32 keyMin,bytes32 keyMax);

    function depositSingle(address tokenIn,address sender,uint256 amountIn) external;

    function swap(bool canswap,SwapCallDataArray listMin,SwapCallDataArray listMax,address pooladr,uint256 amountMinCounterPart) external;

    function GetPid()external returns (bytes32 pid);
}