const hre = require("hardhat");
var frontendUtil = require('@arcologynetwork/frontend-util/utils/util') 
const nets = require('../network.json');

// This script generates transactions for visiting the Visits contract.
async function main() {
    accounts = await ethers.getSigners(); 
    const provider = new ethers.providers.JsonRpcProvider(nets[hre.network.name].url);
    
    const filename = 'data/parallel_visits.out' // The file to which the transactions will be written
    frontendUtil.ensurePath('data');
    const bt_factory = await ethers.getContractFactory("Visits"); // Visits is the contract name
    const bt = await bt_factory.deploy(); // Deploy the contract
    await bt.deployed();
    console.log(`Deployed Visits at ${bt.address}`); // Log the address of the deployed contract

    for(i=0;i<accounts.length;i++){
      const tx = await bt.connect(accounts[i]).populateTransaction.visit();
      const pk=nets[hre.network.name].accounts[i]
      const signer = new ethers.Wallet(pk, provider);
      const fulltx=await signer.populateTransaction(tx)
      const rawtx=await signer.signTransaction(fulltx)

      frontendUtil.writeFile(filename,rawtx+',\n')
    }
  }

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });