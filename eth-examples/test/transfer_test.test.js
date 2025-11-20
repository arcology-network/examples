const hre = require("hardhat");
var frontendUtil = require('@arcologynetwork/frontend-util/utils/util')
const { expect } = require("chai");

async function main() {
    accounts = await ethers.getSigners(); 

    console.log('======start deploying contract======')
    const transfer_factory = await ethers.getContractFactory("TransferTest");
    const transferTest = await transfer_factory.deploy();
    await transferTest.deployed();
    console.log(`Deployed transferTest at ${transferTest.address}`)

    let gasprice=BigInt(255);

    console.log('======start executing TXs calling getBalance======')
    let tx = await transferTest.getBalance();
    let receipt=await tx.wait();
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
    console.log(`Balance of contract ${frontendUtil.parseEvent(receipt,transferTest,"BalanceEvent")}`)
    let first=frontendUtil.parseEvent(receipt,transferTest,"Balance2Event")
    console.log(`Balance of sneder ${first}`)
    let gasused0=BigInt(receipt.gasUsed)*gasprice;
    console.log(`GasUsed : ${receipt.gasUsed}`)

    console.log('======start executing TXs calling transfer======')
    tx = await transferTest.transferToContract({value:10});
    receipt=await tx.wait();
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
    let transamt=frontendUtil.parseEvent(receipt,transferTest,"TransferEvent");
    console.log(`Transfer to contract ${transamt}`)
    let gasused1=BigInt(receipt.gasUsed)*gasprice;
    console.log(`GasUsed : ${receipt.gasUsed}`)

    console.log('======start executing TXs calling getBalance======')
    tx = await transferTest.getBalance();
    receipt=await tx.wait();
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
    console.log(`Balance of contract ${frontendUtil.parseEvent(receipt,transferTest,"BalanceEvent")}`)
    let balance=frontendUtil.parseEvent(receipt,transferTest,"Balance2Event");
    console.log(`GasUsed : ${receipt.gasUsed}`)

    expect(BigInt(first)-gasused0-BigInt(transamt)-gasused1).to.equal(balance);

    console.log('======start executing TXs calling transferToContract,but it will be failed======')
    tx = await transferTest.transferToContract({value:20});
    await tx.wait()
    .then((rect) => {
        console.log("the transaction was successful")
        receipt=rect;
    })
    .catch((error) => {
        receipt = error.receipt
    })
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
    console.log(`GasUsed : ${receipt.gasUsed}`)

    console.log('======start executing TXs calling getBalance======')
    tx = await transferTest.getBalance();
    receipt=await tx.wait();
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
    console.log(`Balance of contract ${frontendUtil.parseEvent(receipt,transferTest,"BalanceEvent")}`)
    console.log(`Balance of sneder ${frontendUtil.parseEvent(receipt,transferTest,"Balance2Event")}`)
    console.log(`GasUsed : ${receipt.gasUsed}`)
  }

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });