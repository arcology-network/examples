const hre = require("hardhat");
var frontendUtil = require('@arcologynetwork/frontend-util/utils/util')
const nets = require('../network.json');

async function main() {
    accounts = await ethers.getSigners(); 

    const mmp_factory = await ethers.getContractFactory("MyMultiProcess");
    const mmp = await mmp_factory.deploy();
    await mmp.deployed();
    console.log(`Deployed MyMultiProcess Test at ${mmp.address}`)

    

    console.log('===========add =====================')
    tx = await mmp.add(3,2);
    receipt=await tx.wait();
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
    console.log(frontendUtil.parseEvent(receipt,"QueryBalance"))

}

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });