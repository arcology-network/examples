pragma solidity >=0.7.0;

import "@arcologynetwork/concurrentlib/lib/commutative/U256Cum.sol";

contract VendingMachine {

    // Declare state variables of the contract
    address public owner;
    U256Cumulative cupcakeStock;
    mapping (address => uint) public cupcakeBalances;

    event BalanceQuery(uint256 value);

    // When 'VendingMachine' contract is deployed:
    // 1. set the deploying address as the owner of the contract
    // 2. set the deployed smart contract's cupcake balance to 100
    constructor() {
        owner = msg.sender;
        cupcakeStock = new U256Cumulative(0, 5000000);
    }

    // Allow the owner to increase the smart contract's cupcake balance
    function refill(uint amount) public {
        require(msg.sender == owner, "Only the owner can refill.");
        cupcakeStock.add(amount);
    }

    // Allow anyone to purchase cupcakes
    function purchase(uint amount) payable public{
        require(msg.value >= amount * 1 ether, "You must pay at least 1 ETH per cupcake");
        cupcakeStock.sub(amount);
        cupcakeBalances[msg.sender] += amount;
    }

    function getCupcakeStock() public returns(uint256){
        emit BalanceQuery(cupcakeStock.get());
        return cupcakeStock.get();
    }

    function getCupcakeBalances(address addr) public returns(uint256){
        emit BalanceQuery(cupcakeBalances[addr]);
        return cupcakeBalances[addr];
    }
}