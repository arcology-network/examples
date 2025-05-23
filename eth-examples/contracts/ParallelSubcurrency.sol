// This is a parallel subcurrency example from the Solidity documentation. 
// The original contract can be found here: https://docs.soliditylang.org/en/latest/introduction-to-smart-contracts.html#subcurrency-example

// NO changes were made to the original contract. This is natually a parallel contract.

// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0;

contract Coin {
    // The keyword "public" makes variables
    // accessible from other contracts
    address public minter;
    mapping(address => uint) public balances;
    event Balance(uint256 bal);

    // Events allow clients to react to specific
    // contract changes you declare
    event Sent(address from, address to, uint amount);

    // Constructor code is only run when the contract
    // is created
    constructor() {
        minter = msg.sender;
    }

    // Sends an amount of newly created coins to an address
    // Can only be called by the contract creator
    function mint(address receiver, uint amount) public {
        require(msg.sender == minter);
        balances[receiver] += amount;
    }

    // Errors allow you to provide information about
    // why an operation failed. They are returned
    // to the caller of the function.
    // error InsufficientBalance(uint requested, uint available);

    // Sends an amount of existing coins
    // from any caller to an address
    function send(address receiver, uint amount) public {
        // if (amount > balances[msg.sender])
        //     revert InsufficientBalance({
        //         requested: amount,
        //         available: balances[msg.sender]
        //     });
        require(amount <= balances[msg.sender],"InsufficientBalance");
        balances[msg.sender] -= amount;
        balances[receiver] += amount;
        emit Sent(msg.sender, receiver, amount);
    }

    function getter(address sender) public returns(uint256) {
        emit Balance(balances[sender]);
        return balances[sender];
    }
}