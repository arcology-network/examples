// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0;

contract TransferTest {
    uint counter;
    event BalanceEvent(uint256 bal);
    event Balance2Event(uint256 senderbalance);
    event TransferEvent(uint256 bal);
    event DebugEvent(uint256 step);

    constructor() {
        counter = 0 ;
    }

    // transfer to contract 
    function transderToContract() payable public {
        payable(address(this)).transfer(msg.value);
        emit TransferEvent(msg.value);
        require(counter == 0);
        counter = 1 ;
    }
    
    // get balance of contract 
    function getBalance() public {
        // emit DebugEvent(1);
        emit BalanceEvent(address(this).balance);
        // emit DebugEvent(2);
        emit Balance2Event(msg.sender.balance);
        // emit DebugEvent(3);
    }
    
    fallback() external payable {}    
    receive() external payable {}
}