const hre = require("hardhat");

/**
 * Creates transactions for minting and transferring tokens using the DSToken contract.
 * The transactions are written to files in the data directory that can be used to submit to the network in batches.
 * @returns {Promise<void>} A promise that resolves when the transactions are created.
 */
async function main() {
  const Vote_factory = await ethers.getContractFactory("Ballot");
  var proposals= new Array();
  proposals.push(hre.ethers.utils.formatBytes32String("Alice"));
  proposals.push(hre.ethers.utils.formatBytes32String("Bob"));

  const vote = await Vote_factory.deploy(proposals);
  await vote.deployed();
  console.log(`Deployed vote at ${vote.address}`)

  const coin_factory = await ethers.getContractFactory("SubCoin");
  const coin = await coin_factory.deploy();
  await coin.deployed();
  console.log(`Deployed SubCoin at ${coin.address}`)
    
  }

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });