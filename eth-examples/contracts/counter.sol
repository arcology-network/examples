// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0;

contract Counter {    
    uint256 public iCount;

    constructor() {
        iCount = 0 ;
    }

    function add(uint256 value) public {
        iCount = iCount + value ;
    }
}