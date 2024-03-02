const hre = require("hardhat");
var frontendUtil = require('@arcologynetwork/frontend-util/utils/util') 
const nets = require('../network.json');

/**
 * Creates transactions for minting and transferring tokens using the DSToken contract.
 * The transactions are written to files in the data directory that can be used to submit to the network in batches.
 * @returns {Promise<void>} A promise that resolves when the transactions are created.
 */
async function main() {
    const token_factory = await ethers.getContractFactory("DSToken"); // DSToken is the contract name
    const dstoken = await token_factory.deploy('ACL'); // ACL is the symbol of the token
    await dstoken.deployed(); // Wait for the contract to be deployed
    console.log(`Deployed DsToken at ${dstoken.address}`)
    
  }

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });