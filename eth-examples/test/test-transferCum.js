const hre = require("hardhat");
var frontendUtil = require('@arcologynetwork/frontend-util/utils/util')

async function main() {
    accounts = await ethers.getSigners(); 

    const tc_factory = await ethers.getContractFactory("TransferCum");
    const tc = await tc_factory.deploy();
    await tc.deployed();
    console.log(`Deployed TransferCum at ${tc.address}`)

    console.log('===========transfer will be failed=====================')
    let tx = await tc.refund(1,{value:100});

    let receipt
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
  }

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });