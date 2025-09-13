// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0;

import "@arcologynetwork/concurrentlib/lib/map/AddressU256Cum.sol";
import "@arcologynetwork/concurrentlib/lib/commutative/U256Cum.sol";

// This example is a parallelized version of the vending machine example from
// https://ethereum.org/developers/docs/smart-contracts/#a-digital-vending-machine
// This version allows multiple purchases and refills to be processed concurrently
// using the Arcology Network's concurrent libraries.
contract VendingMachine {

    // Declare state variables of the contract
    address public owner;
    // mapping (address => U256Cum) public cupcakeBalances;
    // We use an AddressU256CumMap to store cupcake balances instead of a mapping
    // The data structure has the advantage of being able to efficiently handle
    // concurrent updates to the same entry.
    AddressU256CumMap cupcakeBalances = new AddressU256CumMap();

    // U256Cumulative cupcakeStock;

    event BalanceQuery(uint256 value);

    // When 'VendingMachine' contract is deployed:
    // 1. set the deploying address as the owner of the contract
    // 2. set the deployed smart contract's cupcake balance to 100
    constructor() {
        owner = msg.sender;

        // Set the smart contract's cupcake balance to 100, the lower bounds
        // is 0 and the upper bounds is type(uint256).max
        cupcakeBalances.set(address(this), 0, 0, type(uint256).max);
        // cupcakeStock = new U256Cumulative(0, 5000000);
    }

    // Allow the owner to increase the smart contract's cupcake balance
    function refill(uint256 amount) public {
        require(msg.sender == owner, "Only the owner can refill.");
        cupcakeBalances.set(address(this), int256(amount)); 
    }

    // Allow anyone to purchase cupcakes
    function purchase(uint256 amount) public payable {
        require(msg.value >= amount * 1 ether, "You must pay at least 1 ETH per cupcake");
        cupcakeBalances.set(address(this),-int256(amount), 0, type(uint256).max);
        cupcakeBalances.set(msg.sender,int256(amount), 0, type(uint256).max);
    }

    function getCupcakeStock() public returns(uint256){
        emit BalanceQuery(cupcakeBalances.get(address(this)));
        return cupcakeBalances.get(address(this));
    }

    function getCupcakeBalances(address addr) public returns(uint256){
        emit BalanceQuery(cupcakeBalances.get(addr));
        return cupcakeBalances.get(addr);
    }
}