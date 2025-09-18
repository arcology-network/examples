// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0;

import "@arcologynetwork/concurrentlib/lib/commutative/U256Cum.sol"; 
import "@arcologynetwork/concurrentlib/lib/runtime/Runtime.sol"; 

// This counter supports commutative updates, allowing safe aggregation
// of increments from multiple transactions in parallel.
contract VisitCounter { 
    // A cumulative counter instance that allows concurrent increments
    // from multiple transactions without conflicts.   
    U256Cumulative totalVisit; 
    event CounterQuery(uint256 value);

    constructor()  {
        // Initialize the cumulative counter with a starting value of 0
        // and an upper limit of 1,000,000. Any attempt to exceed the
        // range will cause the transaction to revert.
        totalVisit = new U256Cumulative(0, 1000000);
    }

    // Increments the visit counter by 1.
    // Multiple invocations in the same generation can be executed in parallel
    // and will be merged deterministically by Arcology at commit time.
    function visit() public {
        totalVisit.add(1); 
    }

    // Retrieves the current counter value and emits it in an event.
    function getCounter() public returns (uint256) {
        uint256 v = totalVisit.get();
        emit CounterQuery(v);
        return v;
    }
}


// This counter supports commutative updates, allowing safe aggregation
// of increments from multiple transactions in parallel.
contract VisitCounterWithDeferred { 
// A cumulative counter instance that allows concurrent increments
    // from multiple transactions without conflicts.   
    U256Cumulative totalVisit; 
    
    event CounterQuery(uint256 value);

    constructor()  {
        // Initialize the cumulative counter with a starting value of 0
        // and an upper limit of 1,000,000. Any attempt to exceed the
        // range will cause the transaction to revert.
        totalVisit = new U256Cumulative(0, 1000000);

        // Inform the scheduler when there are multiple invocations
        // to visit() function, one of them will be executed in the
        // deferred transaction. Each call to visit() is charged an 
        // extra 2,000 gas to fund the deferred join step run later
        // in the block. If the deferred transaction fails, 
        // the unused gas is refunded.
        // Runtime.defer("visit()", 2000);
        Runtime.defer("visit()",50000);   
    }

    // Increments the visit counter by 1.
    // Multiple invocations in the same generation can be executed in parallel
    // and will be merged deterministically by Arcology at commit time.
    function visit() public {
        // The line below adds 1 to the visit counter, which will executed anyway.
        totalVisit.add(1);

        // If the transaction is in a deferred generation, emit the counter value.
        // The code is executed in the deferred transaction only.
        if (Runtime.isInDeferred()) {
            emit CounterQuery(totalVisit.get());
        }
    }
}