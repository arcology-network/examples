const hre = require("hardhat");
var frontendUtil = require('@arcologynetwork/frontend-util/utils/util') 
const { expect } = require("chai");

async function main() {
    accounts = await ethers.getSigners(); 

    const sender=accounts[0];
    const receiver=accounts[1];

    const senderBalanceBefore = await ethers.provider.getBalance(sender.address);
    const receiverBalanceBefore = await ethers.provider.getBalance(receiver.address);

    console.log("Sender:", sender.address);
    console.log("Receiver:", receiver.address);

    const tx = {
      to: receiver.address,
      value: ethers.utils.parseEther("1.0"), 
    };

    const txResponse = await sender.sendTransaction(tx);
    const receipt = await txResponse.wait();
    console.log("Transaction hash:", receipt.transactionHash);

    const senderBalanceAfter = await ethers.provider.getBalance(sender.address);
    const receiverBalanceAfter = await ethers.provider.getBalance(receiver.address);

    console.log("Sender balance change:", senderBalanceBefore - senderBalanceAfter);
    console.log("Receiver balance change:", receiverBalanceAfter - receiverBalanceBefore);
  }

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });