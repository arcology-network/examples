// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;
import "./HashU256Cum.sol";
import "@arcologynetwork/concurrentlib/lib/map/AddressU256Cum.sol";

contract HashCum {
    HashU256Map1 private cummap=new HashU256Map1();
    AddressU256CumMap private cummapadr=new AddressU256CumMap();
    constructor() {
    }

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

    // function insert(address adr,uint256 val)public { 
    //     // emit QueryBalance(0);
    //     // bytes32 key=abi.decode(abi.encodePacked(adr,"1"), (bytes32)); 
    //     emit QueryBalance(1);
    //     cummapadr.set(adr, int256(val), 0, type(uint256).max);
    //     emit QueryBalance(2);
    // }
}