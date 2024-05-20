const hre = require("hardhat");
var frontendUtil = require('@arcologynetwork/frontend-util/utils/util') 
const nets = require('../network.json');

// This script generates transactions for visiting the like contract.
async function main() {
    accounts = await ethers.getSigners(); 
    const provider = new ethers.providers.JsonRpcProvider(nets[hre.network.name].url);

    const filename = 'data/coin-vote.out' // The file to which the transactions will be written
    frontendUtil.ensurePath('data');
    const handle=frontendUtil.newFile(filename)
    
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



    const pk=nets[hre.network.name].accounts[0]
    const signer = new ethers.Wallet(pk, provider);
    let tx,fulltx,rawtx
    for(i=0;i<accounts.length;i++){
      tx = await vote.connect(accounts[0]).populateTransaction.giveRightToVote(accounts[i].address);
      fulltx=await signer.populateTransaction(tx)
      rawtx=await signer.signTransaction(fulltx)
      
      frontendUtil.appendTo(handle,rawtx+',\n')

      tx = await coin.connect(accounts[0]).populateTransaction.mint(accounts[i].address,10+i);
      fulltx=await signer.populateTransaction(tx)
      rawtx=await signer.signTransaction(fulltx)
      
      frontendUtil.appendTo(handle,rawtx+',\n')
    }
  }

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });