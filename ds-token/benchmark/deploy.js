const hre = require("hardhat");
var ptool = require('../test/tools') 

async function main() {

    accounts = await ethers.getSigners(); 

    const token_factory = await ethers.getContractFactory("DSToken");
    const dstoken = await token_factory.deploy('ACL');
    await dstoken.deployed();
    console.log(`Deployed DsToken at ${dstoken.address}`)

  }

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });