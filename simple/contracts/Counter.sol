// SPDX-License-Identifier: MIT
pragma solidity >=0.7.6;
import "@arcologynetwork/concurrentlib/lib/commutative/U256Cum.sol";

contract Counter {
    U256Cumulative sum=new U256Cumulative(0,type(uint256).max);
    event QueryBalance(uint256 val);

    function add(uint256 val)public {  
        sum.add(val);
    }

    function reset()public {  
        sum.sub(sum.get());
        emit QueryBalance(sum.get());
    }
}