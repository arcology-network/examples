const hre = require("hardhat");
var frontendUtil = require('@arcologynetwork/frontend-util/utils/util') 
const nets = require('../network.json');

// This script generates transactions for visiting the like contract.
async function main() {
    accounts = await ethers.getSigners(); 
    const provider = new ethers.providers.JsonRpcProvider(nets[hre.network.name].url);

    const filename = 'data/parallel_likes.out' // The file to which the transactions will be written
    frontendUtil.ensurePath('data');
    const handle=frontendUtil.newFile(filename)
    
    const li_factory = await ethers.getContractFactory("Like"); // Like is the contract name
    const li = await li_factory.deploy(); // Deploy the contract
    await li.deployed();
    console.log(`Deployed Likes at ${li.address}`); // Log the address of the deployed contract

    for(i=0;i<accounts.length;i++){
      const tx = await li.connect(accounts[i]).populateTransaction.like();
      const pk=nets[hre.network.name].accounts[i]
      const signer = new ethers.Wallet(pk, provider);
      const fulltx=await signer.populateTransaction(tx)
      const rawtx=await signer.signTransaction(fulltx)
      
      frontendUtil.appendTo(handle,rawtx+',\n')
    }
  }

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });