// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0;

contract Counter {
    
    uint256 iCount;

    event CounterQuery(uint256 value);

    constructor() {
        iCount = 0 ;
    }

    function add(uint256 value) public {
        iCount = iCount + value ;
    }

    function getCounter() public returns(uint256){
        emit CounterQuery(iCount);
        return iCount;
    }

}