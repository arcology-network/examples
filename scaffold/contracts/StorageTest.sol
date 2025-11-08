// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@arcologynetwork/concurrentlib/lib/commutative/U256Cum.sol";

contract StorageTest {
    uint256 public a = 42;
    uint256 public b = 1234;
    mapping(address => uint256) public balance;
    U256Cumulative total = new U256Cumulative(0, type(uint256).max); // Using a commutative counter to store the number of likes. 

    event Step(uint256 indexed val);
    event Step2(uint256 val);

    constructor() {
        balance[msg.sender] = 999;
    }

    function add(uint256 val) public {
        emit Step(0);
        emit Step2(0);
        require(val<10000,"too large");
        emit Step(1);
        emit Step2(1);
        total.add(val);
        emit Step(2);
        emit Step2(2);
    } 

}