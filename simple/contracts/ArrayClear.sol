// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0;
pragma abicoder v2;

import "@arcologynetwork/concurrentlib/lib/array/U256.sol";
import "@arcologynetwork/concurrentlib/lib/runtime/Runtime.sol";
import "@arcologynetwork/concurrentlib/lib/commutative/U256Cum.sol";


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

    U256Cumulative sum=new U256Cumulative(0, 100); 

    constructor()  {
        Runtime.defer(bytes4(keccak256(bytes("pvisit((uint256,uint256))")))); 
        Runtime.defer(bytes4(keccak256(bytes("add(uint256)"))));                                                                                    
    }

    function pvisit(ExactInputSingleParams calldata params) public {
        // if(flags.committedLength()==0){
        //     counter.clear();
        // }
        counter.push(params.seed); 
        flags.push(1);

        if(flags.committedLength()>0){

            for(uint i=0;i<counter.fullLength();i++){
                if(!counter._exists(i)) continue;
                sum.add(counter.get(i));
            }

            counter.clear();
            flags.clear();
        }
    }
    function add(uint256 val)public {
        //g1:3 t g2:1 t g3:3 2c 1t g4:1 t
        counterAdd.push(val); 
        flagsAdd.push(1);

        emit CounterQuery(flagsAdd.committedLength());
        if(flagsAdd.committedLength()>0){

            emit CounterQuery(counterAdd.fullLength());
            emit CounterQuery(counterAdd.nonNilCount());
            emit CounterQuery(counterAdd.committedLength());

            for(uint i=0;i<counterAdd.fullLength();i++){
                if(!counterAdd._exists(i)) continue;
                sum.add(counterAdd.get(i));
            }

            emit CounterQuery(counter.fullLength());

            counterAdd.clear();
            flagsAdd.clear();
        }
    }

    function getCounter() public returns(uint256){
        emit CounterQuery(sum.get());
        return sum.get();
    }
}