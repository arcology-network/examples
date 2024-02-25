const hre = require("hardhat");
var ptool = require('@arcologynetwork/concurrentlib/js/tools') 

const nets = require('../network.json');

async function main() {

    accounts = await ethers.getSigners(); 
    const filename = 'bool_visit.out'

    const bt_factory = await ethers.getContractFactory("BoolTest");
    const bt = await bt_factory.deploy();
    await bt.deployed();
    console.log(`Deployed Bool Test at ${bt.address}`);

    for(i=0;i<accounts.length;i++){
      const tx = await bt.connect(accounts[i]).populateTransaction.visit();
      console.log(tx);

      const pk=nets[hre.network.name].accounts[i]
      const RPC_ENDPOINT=nets[hre.network.name].url
      const provider = new ethers.providers.JsonRpcProvider(RPC_ENDPOINT);
      const signer = new ethers.Wallet(pk, provider);

      const fulltx=await signer.populateTransaction(tx)
      console.log(fulltx);

      const rawtx=await signer.signTransaction(fulltx)
      console.log(rawtx);

      ptool.writefile(filename,rawtx+',\n')
    }

  }

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });