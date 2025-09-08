// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;
import "@arcologynetwork/concurrentlib/lib/map/AddressU256Cum.sol";


contract AddrCum256 {
    AddressU256CumMap private cummap=new AddressU256CumMap();

    constructor() {
    }

    event QueryBalance(uint256 val);

    function add(address adr,uint256 val)public {  
        cummap.set(adr, int256(val), 0, 100);
    }

}