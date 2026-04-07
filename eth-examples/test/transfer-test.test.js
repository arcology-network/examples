const hre = require("hardhat");
var cliUtil = require('@arcologynetwork/cli-util/utils/util')
const { expect } = require("chai");


async function main() {
    accounts = await ethers.getSigners(); 

    const {rpcUrl,pks}=cliUtil.parseNetworkV2(hre)
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const nonceManage=await cliUtil.InitNonces(pks,provider)

    console.log('======start deploying contract======')
    let nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
    const transfer_factory = await ethers.getContractFactory("TransferTest");
    const transferTest = await transfer_factory.deploy({nonce:nextnonce});
    await transferTest.deployed();
    console.log(`Deployed transferTest at ${transferTest.address}`)

    let gasprice=BigInt(255);

    console.log('======start executing TXs calling getBalance======')
    nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
    let tx = await transferTest.getBalance({nonce:nextnonce});
    let receipt=await tx.wait();
    cliUtil.showResult(cliUtil.parseReceipt(receipt));
    console.log(`Balance of contract ${cliUtil.parseEvent(receipt,transferTest,"BalanceEvent")}`)
    let first=cliUtil.parseEvent(receipt,transferTest,"Balance2Event")
    console.log(`Balance of sneder ${first}`)
    let gasused0=BigInt(receipt.gasUsed)*gasprice;
    console.log(`GasUsed : ${receipt.gasUsed}`)

    console.log('======start executing TXs calling transfer======')
    nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
    tx = await transferTest.transferToContract({value:10,nonce:nextnonce});
    receipt=await tx.wait();
    cliUtil.showResult(cliUtil.parseReceipt(receipt));
    let transamt=cliUtil.parseEvent(receipt,transferTest,"TransferEvent");
    console.log(`Transfer to contract ${transamt}`)
    let gasused1=BigInt(receipt.gasUsed)*gasprice;
    console.log(`GasUsed : ${receipt.gasUsed}`)

    console.log('======start executing TXs calling getBalance======')
    nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
    tx = await transferTest.getBalance({nonce:nextnonce});
    receipt=await tx.wait();
    cliUtil.showResult(cliUtil.parseReceipt(receipt));
    console.log(`Balance of contract ${cliUtil.parseEvent(receipt,transferTest,"BalanceEvent")}`)
    let balance=cliUtil.parseEvent(receipt,transferTest,"Balance2Event");
    console.log(`GasUsed : ${receipt.gasUsed}`)

    expect(BigInt(first)-gasused0-BigInt(transamt)-gasused1).to.equal(balance);

    console.log('======start executing TXs calling transferToContract,but it will be failed======')
    nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
    tx = await transferTest.transferToContract({value:20,nonce:nextnonce});
    await tx.wait()
    .then((rect) => {
        console.log("the transaction was successful")
        receipt=rect;
    })
    .catch((error) => {
        receipt = error.receipt
    })
    cliUtil.showResult(cliUtil.parseReceipt(receipt));
    console.log(`GasUsed : ${receipt.gasUsed}`)

    console.log('======start executing TXs calling getBalance======')
    nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
    tx = await transferTest.getBalance({nonce:nextnonce});
    receipt=await tx.wait();
    cliUtil.showResult(cliUtil.parseReceipt(receipt));
    console.log(`Balance of contract ${cliUtil.parseEvent(receipt,transferTest,"BalanceEvent")}`)
    console.log(`Balance of sneder ${cliUtil.parseEvent(receipt,transferTest,"Balance2Event")}`)
    console.log(`GasUsed : ${receipt.gasUsed}`)
  }

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });