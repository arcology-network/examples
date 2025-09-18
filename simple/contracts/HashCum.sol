// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;
import "@arcologynetwork/concurrentlib/lib/map/HashU256Cum.sol";
import "@arcologynetwork/concurrentlib/lib/map/AddressU256Cum.sol";

contract HashCum {
    HashU256Map private cummap=new HashU256Map();
    AddressU256CumMap private cummapadr=new AddressU256CumMap();
    
    event QueryBalance(uint256 val);
    uint256 fix=1;

    function insert(address adr,uint256 val)public { 
        emit QueryBalance(0);
        bytes32 key=abi.decode(abi.encodePacked(adr,fix), (bytes32)); 
        emit QueryBalance(1);
        cummap.set(key, val, 0, type(uint256).max);
        emit QueryBalance(2);
    }

    function getBalance(address adr)public {
        bytes32 key=abi.decode(abi.encodePacked(adr,fix), (bytes32));
        emit QueryBalance(cummap.get(key)); 
    }
}