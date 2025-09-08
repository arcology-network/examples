// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;


import "@arcologynetwork/concurrentlib/lib/array/U256.sol";
import "@arcologynetwork/concurrentlib/lib/runtime/Runtime.sol";

contract Clear {

    U256 counter = new U256();
    uint256 total=0;
    uint64 gasused=80000;  //100000000;  //

    constructor() {
        Runtime.defer("add(uint256)",gasused);    
    }

    event PoolStep(uint256 fee);

    function add(
        uint256 val
    ) external {
        counter.push(val); 

        if(Runtime.isInDeferred()){
            uint256 size=counter.fullLength();
            for(uint256 i=0;i<size;i++){
                total=total+counter.get(i);
            }
            emit PoolStep(total);

            counter.clear();
        }
    }
}