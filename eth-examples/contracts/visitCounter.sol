// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0 <0.9.0;

import "@arcologynetwork/concurrentlib/lib/commutative/U256Cum.sol";

contract VisitCounter {
    
    U256Cumulative visitCount;

    event CounterQuery(uint256 value);

    constructor()  {
        visitCount = new U256Cumulative(0, 1000000) ;
    }

    function visit(uint256 weight) public {
        visitCount.add(weight);
    }

    function getCounter() public returns(uint256){
        emit CounterQuery(visitCount.get());
        return visitCount.get();
    }

}