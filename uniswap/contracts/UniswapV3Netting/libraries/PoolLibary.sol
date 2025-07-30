// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.6.0;
import '../../UniswapV3Periphery/libraries/PoolAddress.sol';

library PoolLibary {
    function GetKey(address poolAdr,address token) internal returns(bytes32){
        return abi.decode(abi.encodePacked(poolAdr,token), (bytes32));
    }
    
    function computePoolAdr(address poolfactory,address tokenIn,address tokenOut, uint24 fee) internal returns(address){
        return PoolAddress.computeAddress(poolfactory, PoolAddress.getPoolKey(tokenIn, tokenOut, fee));
    }
}