// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;
pragma abicoder v2;

import "@arcologynetwork/concurrentlib/lib/shared/Base.sol";
import "@arcologynetwork/concurrentlib/lib/shared/Const.sol";

contract PoolDatas is Base{
    struct PoolData {
        address tokenA;
        address tokenB;
    }

    constructor() Base(Const.BYTES) {}

    /**
     * @notice Check if a given key exists in the map.
     * @param k The address key to check for existence.
     * @return true if the key exists, false otherwise.
     */
    function exist(address k) public returns(bool) { 
        return Base.exists(abi.encodePacked(k));
    }

    /**
     * @notice Set a key-value pair in the map.
     * @param k The address key to set.
     * @param tokenA The address value associated with the key.
     * @param tokenB The address value associated with the key.
     */
    function set(address k,address tokenA,address tokenB) public { 
        if (tokenA > tokenB) (tokenA, tokenB) = (tokenB, tokenA);
        bytes memory data=abi.encode(PoolData({tokenA:tokenA,tokenB:tokenB}));
        Base._set(abi.encodePacked(k), data);       
    }

    /**
     * @notice Get the value associated with a given key in the map.
     * @param k The address key to retrieve the associated value.
     * @return tokenA address value associated with the key.
     * @return tokenB address value associated with the key.
     */
    function get(address k) public virtual returns(address tokenA,address tokenB){ 
        (,bytes memory data)=Base._get(abi.encodePacked(k));
        PoolData memory pd = abi.decode(data, (PoolData));  
        tokenA = pd.tokenA;
        tokenB = pd.tokenB;
    }   

    
    function keyAt(uint256 idx) public virtual  returns(address) {  
        bytes memory rawdata=Base.indToKey(idx);
        bytes20 resultAdr;
        for (uint i = 0; i < 20; i++) {
            resultAdr |= bytes20(rawdata[i]) >> (i * 8); 
        }
        return address(uint160(resultAdr));  
    }   

  
    function valueAt(uint256 idx) public virtual returns(address tokenA,address tokenB){ 
        (,bytes memory data)=Base._get(idx);
        PoolData memory pd = abi.decode(data, (PoolData));  
        tokenA = pd.tokenA;
        tokenB = pd.tokenB; 
    }    

    /**
     * @notice Delete a key-value pair from the map.
     * @param k The address key to delete.
     */
    function del(address k) public { 
        Base._del((abi.encodePacked(k)));  
    }
}