// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0;
import "@arcologynetwork/concurrentlib/lib/commutative/U256Cum.sol";

contract BoundedCounter {
    U256Cumulative sum=new U256Cumulative(0,100);
    event QueryBalance(uint256 val);

    function add(uint256 val)public {  
        sum.add(val);
        emit QueryBalance(sum.get());
    }
    function sub(uint256 val)public {  
        sum.sub(val);
        emit QueryBalance(sum.get());
    }

    function reset()public {  
        sum.sub(sum.get());
        emit QueryBalance(sum.get());
    }
}