// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;


import "@arcologynetwork/concurrentlib/lib/array/U256.sol";
import "@arcologynetwork/concurrentlib/lib/runtime/Runtime.sol";

contract TempContract {

    U256 counter = new U256(true);
    uint256 total=0;
    uint64 gasused=100000;

    constructor() {
        Runtime.defer(bytes4(keccak256(bytes("add(uint256)"))),gasused);    
    }

    event PoolStep(uint256 fee);

    function add(
        uint256 val
    ) external {
        counter.push(val); 

        if(Runtime.isInDeferred()){
            uint256 size=counter.fullLength();
            emit PoolStep(size);
            emit PoolStep(15);
            for(uint256 i=0;i<size;i++){
                uint256 val1=counter.get(i);
                emit PoolStep(val1);
                total=total+val1;
            }
        }
        emit PoolStep(16);
        emit PoolStep(total);
    }
}