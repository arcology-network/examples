// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

import "@arcologynetwork/concurrentlib/lib/array/Bool.sol";

contract BoolTest {
    
    Bool boolContainer ;
    event CounterQuery(uint256 value);

    constructor()  {
        boolContainer = new Bool();
    }

    function visit() public {
        boolContainer.push(true);
    }

    function getCounter() public returns(uint256){
        emit CounterQuery(boolContainer.length());
        return boolContainer.length();
    }
}