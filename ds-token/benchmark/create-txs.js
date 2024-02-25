const hre = require("hardhat");
var ptool = require('@arcologynetwork/concurrentlib/js/tools') 

const nets = require('../network.json');

async function main() {

    accounts = await ethers.getSigners(); 
    const filename_mint = 'dstoken-mint.out'
    const filename_transfer = 'dstoken-transfer.out'

    const token_factory = await ethers.getContractFactory("DSToken");
    const dstoken = await token_factory.deploy('ACL');
    await dstoken.deployed();
    console.log(`Deployed DsToken at ${dstoken.address}`)

    console.time('minttime')
    const pk=nets[hre.network.name].accounts[0]
    for(i=0;i<accounts.length;i++){
      const tx = await dstoken.populateTransaction.mint(accounts[i].address,10);
      
      const RPC_ENDPOINT=nets[hre.network.name].url
      const provider = new ethers.providers.JsonRpcProvider(RPC_ENDPOINT);
      const signer = new ethers.Wallet(pk, provider);
      const fulltx=await signer.populateTransaction(tx)
      const rawtx=await signer.signTransaction(fulltx)

      ptool.writefile(filename_mint,rawtx+',\n')
    }
    console.timeEnd('minttime')

    console.time('transfertime')
    const num_per_bat=200;
    const total_bats = accounts.length % num_per_bat ===0 ? parseInt(accounts.length / num_per_bat) : parseInt(accounts.length / num_per_bat) + 1 ;
    

    for(batidx=0;batidx<total_bats;batidx++){
      const totals_per_bat = accounts.length - batidx * num_per_bat>=num_per_bat ? num_per_bat : accounts.length - batidx * num_per_bat ;
      const txs=parseInt(totals_per_bat/2);

      for(i=batidx * num_per_bat;i<batidx * num_per_bat+txs;i++){
        const tx = await dstoken.connect(accounts[i]).populateTransaction.transfer(accounts[i+txs].address,1);
        const pk=nets[hre.network.name].accounts[i]
        const RPC_ENDPOINT=nets[hre.network.name].url
        const provider = new ethers.providers.JsonRpcProvider(RPC_ENDPOINT);
        const signer = new ethers.Wallet(pk, provider);
        const fulltx=await signer.populateTransaction(tx)
        const rawtx=await signer.signTransaction(fulltx)

        ptool.writefile(filename_transfer,rawtx+',\n')
      }
    }
    console.timeEnd('transfertime')
  }

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });