// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0;
pragma abicoder v2;

import "@arcologynetwork/concurrentlib/lib/array/U256.sol";
import "@arcologynetwork/concurrentlib/lib/runtime/Runtime.sol";


// This simple contract counts the number of visits to the contract. It uses the Bool contract provided by the concurrentlib
// to support concurrent writes to the contract.
contract ArrayClear {
    struct ExactInputSingleParams {
        uint256 seed;
        uint256 sd;
    }

    U256 counter = new U256();
    U256 flags = new U256(); 

    U256 counterAdd = new U256();
    U256 flagsAdd = new U256(); 
    event CounterQuery(uint256 value);

    constructor()  {
        Runtime.defer(bytes4(keccak256(bytes("pvisit((uint256,uint256))")))); 
        Runtime.defer(bytes4(keccak256(bytes("add(uint256)"))));                                                                                    
    }

    function pvisit(ExactInputSingleParams calldata params) public {
        if(flags.committedLength()==0){
            counter.clear();
            // emit CounterQuery(counter.fullLength());
        }
        counter.push(params.seed); // Add a new visit to the counter. Concurrent writes are OK !!.
        flags.push(1);

        if(flags.committedLength()>0){
            flags.clear();

            emit CounterQuery(counter.nonNilCount());
            emit CounterQuery(counter.committedLength());
            emit CounterQuery(counter.fullLength());

            uint256 total=0;
            for(uint i=0;i<counter.fullLength();i++){
                if(!counter._exists(i)) continue;
                total=total+counter.get(i);
            }
            emit CounterQuery(total);
        }
    }
    function add(uint256 val)public {
        if(flagsAdd.committedLength()==0){
            counterAdd.clear();
        }
        counterAdd.push(val); 
        flagsAdd.push(1);

        if(flagsAdd.committedLength()>0){
            flagsAdd.clear();
            emit CounterQuery(counterAdd.nonNilCount());

            uint256 total=0;
            for(uint i=0;i<counterAdd.fullLength();i++){
                if(!counterAdd._exists(i)) continue;
                total=total+counterAdd.get(i);
            }
            emit CounterQuery(total);

            emit CounterQuery(counter.fullLength());
        }
    }

    function getCounter() public returns(uint256){
        emit CounterQuery(counter.nonNilCount());
        return counter.nonNilCount(); // Return the number of visits to the contract.
    }
}