// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0;
import "@arcologynetwork/concurrentlib/lib/commutative/U256Cum.sol";

contract CumulativeOutofRange {
    U256Cumulative a = new U256Cumulative(0, 1);
    event Purchase(uint256 val);
    uint256 icounter=0;

    function testlogforRevert()public { 
        a.add(1);
        emit Purchase(1);
        require(a.get()==2, "add failed");
    }

    function testlogforConflict()public { 
        a.add(1);
        emit Purchase(1);
        icounter=icounter+1;
    }

    function add()public { 
        a.add(1);
        emit Purchase(1);
    }
    function getCounter() public view returns(uint256){ 
        return a.get();
    }

}