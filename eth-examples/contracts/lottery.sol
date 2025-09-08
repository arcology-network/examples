// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0;

import "@arcologynetwork/concurrentlib/lib/array/Address.sol"; 
import "@arcologynetwork/concurrentlib/lib/runtime/Runtime.sol"; 

// SUPER SIMPLE educational lottery — not secure for real funds.
// join(): send ≥0.005 ETH to join the round.
contract EduLottery {
    Address private _players = new Address();

    // error InsufficientFee(uint256 sent, uint256 required);
    // error NoPlayers();
    event PrizeQuery(uint256 val);
    event PrizeAddressQiery(address addr);

    address winner;
    uint256 prize;

    constructor() {
        // Inform the scheduler that when there are multiple invocations, move one of 
        // them to the next generation for aggregation. All the senders need to pay
        // extra gas fees of 20,000 wei for the deferred execution.
        Runtime.defer("join()",50000);   
    }

    // Joins the lottery by sending ETH. This function can be called in parallel 
    //by multiple users.
    function join() external payable {
        // if (msg.value < 0.005 ether) revert InsufficientFee(msg.value, 0.005 ether);
        require(msg.value >= 0.005 ether,"InsufficientFee");
        _players.push(msg.sender);
         
        // Only draw if this is the deferred transaction
        if (Runtime.isInDeferred()) {
            _draw();
        }
    }

    // Generates a pseudo-random seed.
    function _randomSeed() private view returns (uint256) {
        // Educational pseudo-randomness (prev blockhash, timestamp, contract)
        return uint256(
            keccak256(
                abi.encodePacked(
                    blockhash(block.number - 1),
                    block.timestamp,
                    address(this)
                )
            )
        );
    }

    // Draws a random winner from the players.
    function _draw() internal {
        require(Runtime.isInDeferred(), "only deferred");

        // if (_players.fullLength() == 0) revert NoPlayers();
        require(_players.fullLength() > 0,"NoPlayers");
        uint256 idx = _randomSeed() % _players.fullLength();
        winner = _players.get(idx);

        _players.clear(); // Clear players for the next round
        prize = address(this).balance;
        (bool ok, ) = payable(winner).call{value: prize}("");
        require(ok, "transfer failed");
    }

    function whoWin() external {
        emit PrizeQuery(prize);
        emit PrizeAddressQiery(winner);
    }
}
