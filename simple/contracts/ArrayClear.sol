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

    U256 counter = new U256(false);
    U256 counterAdd = new U256(false);
    event CounterQuery(uint256 value);

    U256Cumulative sum=new U256Cumulative(0, 100); 

    uint64 gasused=100000;

    constructor()  {
        Runtime.defer(bytes4(keccak256(bytes("pvisit((uint256,uint256))"))),gasused); 
        Runtime.defer(bytes4(keccak256(bytes("add(uint256)"))),gasused);                                                                                    
    }
    event Step(uint256 step);
    function pvisit(ExactInputSingleParams calldata params) public {
        emit Step(0);
        if(!Runtime.isInDeferred()){
            counter.clear();
        }
        counter.push(params.seed); 
        emit Step(1);
        if(Runtime.isInDeferred()){
            uint256 size=counter.fullLength();
            for(uint i=0;i<size;i++){
                sum.add(counter.get(i));
            }
        }
    }
    function add(uint256 val)public { 
        if(!Runtime.isInDeferred()){
            counterAdd.clear();
        }
        counterAdd.push(val); 
        if(Runtime.isInDeferred()){
            uint256 size=counterAdd.fullLength();

            for(uint i=0;i<size;i++){
                sum.add(counterAdd.get(i));
            }
            emit CounterQuery(sum.get());
            
        }
    }

    function getCounter() public returns(uint256){
        emit CounterQuery(sum.get());
        return sum.get();
    }
}