// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0;

import "@arcologynetwork/concurrentlib/lib/array/Bool.sol";

// This simple contract counts the number of visits to the contract. It uses the Bool contract provided by the concurrentlib
// to support concurrent writes to the contract.
contract Visits {
    Bool counter = new Bool(); // The counter is a concurrent array of bools.
    event CounterQuery(uint256 value);

    function visit() public {
        emit CounterQuery(counter.committedLength());
        if(counter.committedLength()>0){
            counter.push(true); // Add a new visit to the counter. Concurrent writes are OK !!.
            emit CounterQuery(counter.nonNilCount());
        }else{
            counter.push(true); // Add a new visit to the counter. Concurrent writes are OK !!.
        }            
    }

    function getCounter() public returns(uint256){
        emit CounterQuery(counter.nonNilCount());
        return counter.nonNilCount(); // Return the number of visits to the contract.
    }
}