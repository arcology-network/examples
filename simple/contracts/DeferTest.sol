// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0;
pragma abicoder v2;

import "@arcologynetwork/concurrent/contracts/crdt/array/U256.sol";
import "@arcologynetwork/concurrent/contracts/runtime/Runtime.sol";
import "@arcologynetwork/concurrent/contracts/crdt/scalar/U256Cum.sol";


// This simple contract counts the number of visits to the contract. It uses the Bool contract provided by the concurrentlib
// to support concurrent writes to the contract.
contract DeferTest {
    struct ExactInputSingleParams {
        uint256 parallel;
        uint256 defer;
    }

    U256 counter = new U256();
    event CounterQuery(uint256 value);

    U256Cumulative sum=new U256Cumulative(0, 100); 
    uint64 gasused=50000;

    // Defer the pvisit function and the add function to be executed in the deferred phase.
    constructor()  {
        Runtime.defer("pvisit((uint256,uint256))",gasused);                                                                               
    }
    event Step(uint256 step);

    function pvisit(ExactInputSingleParams calldata params) public {
        bool isDeffered=Runtime.isInDeferred();
        if(!isDeffered){
            counter.clearCommitted();
        }
        
        require(params.parallel==1, "parallel failed");

        counter.push(1);

        if(isDeffered){
            uint256 size=counter.fullLength();
            for(uint i=0;i<size;i++){
                (uint256 ut,)=counter.get(i);
                sum.add(ut);
            }

            require(params.defer==1, "defer failed");
        }
    }
    function getSum() public view returns(uint256){
        return sum.get();
    }
    function getCounter() public returns(uint256){
        uint256 count= counter.fullLength();
        emit CounterQuery(count); 
        return count;
    }
}