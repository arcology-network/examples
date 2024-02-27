const hre = require("hardhat");
var frontendUtil = require('@arcologynetwork/frontend-util/utils/util') 
const nets = require('../network.json');

// This script generates transactions for visiting the Visits contract.
async function main() {
    accounts = await ethers.getSigners(); 
    const filename = 'data/parallel_likes.out' // The file to which the transactions will be written
    frontendUtil.ensurePath('data');
    const li_factory = await ethers.getContractFactory("Like"); // Like is the contract name
    const li = await li_factory.deploy(); // Deploy the contract
    await li.deployed();
    console.log(`Deployed Likes at ${li.address}`); // Log the address of the deployed contract

    for(i=0;i<accounts.length;i++){
      const tx = await li.connect(accounts[i]).populateTransaction.like();

      const pk=nets[hre.network.name].accounts[i]
      const RPC_ENDPOINT=nets[hre.network.name].url
      const provider = new ethers.providers.JsonRpcProvider(RPC_ENDPOINT);
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