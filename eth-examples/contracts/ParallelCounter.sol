// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0;
import "@arcologynetwork/concurrentlib/lib/commutative/U256Cum.sol";

contract ParallelCounter {
    
    U256Cumulative visitCount1;
    U256Cumulative visitCount2;
    U256Cumulative visitCount3;
    uint256 iCount;

    event CounterQuery(uint256 value1,uint256 value2,uint256 value3);

    constructor() {
        visitCount1 = new U256Cumulative(0, 1000000) ;
        visitCount2 = new U256Cumulative(0, 1000000) ;
        visitCount3 = new U256Cumulative(0, 1000000) ;
        iCount = 0 ;
    }

    function add1(uint256 value) public {
        visitCount1.add(value);
        visitCount2.add(value);
        iCount = iCount + 1 ;
        
    }
    function add2(uint256 value) public {
        visitCount3.add(value);
        visitCount2.add(value);
    }

    function reset() public {
        visitCount1 = new U256Cumulative(0, 1000000) ;
        visitCount2 = new U256Cumulative(0, 1000000) ;
        visitCount3 = new U256Cumulative(0, 1000000) ;
    }


    function getCounter() public returns(uint256){
        emit CounterQuery(visitCount1.get(),visitCount2.get(),visitCount3.get());
        return iCount;
    }

}