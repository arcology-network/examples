const hre = require("hardhat");
var frontendUtil = require('@arcologynetwork/frontend-util/utils/util')

async function main() {
    const vending_factory = await ethers.getContractFactory("VendingMachine");
    const vendingMachine = await vending_factory.deploy();
    await vendingMachine.deployed();
    console.log(`Deployed vendingMachine at ${vendingMachine.address}`)

    let receipt;
    console.log('===========refill=====================')
    tx = await vendingMachine.refill(300000);
    receipt=await tx.wait();
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
  }

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });