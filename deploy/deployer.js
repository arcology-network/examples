const hre = require("hardhat");
const fs = require('fs');


async function main() {

    const Vote_factory = await ethers.getContractFactory("Ballot");
    const vote = await Vote_factory.deploy();
    await vote.deployed();
    console.log(`Deploy vote at ${vote.address}`)

  }

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });