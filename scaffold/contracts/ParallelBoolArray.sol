// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0 <0.9.0;
​
import "@arcologynetwork/concurrentlib/lib/array/Bool.sol";
​
contract BoolArray {
    // The concurrent Bool array is used to store boolean values in a thread-safe and 
    // deterministic manner.
    Bool boolContainer = new Bool();
    
    // Append safely in parallel, no conflicts. This function is thread-safe
    function add() {  
        boolContainer.push(true);
    }
    
    // This function is also thread-safe when called in parallel alone but will conflict with add()
    // if they are called in parallel together.
    function length() public view returns(uint256){  
        return boolContainer.fullLength();
    }    
}