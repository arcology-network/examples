const hre = require("hardhat");
var frontendUtil = require('@arcologynetwork/frontend-util/utils/util') 

const nets = require('../network.json');

async function main() {

    accounts = await ethers.getSigners(); 
    const filename_transfer = 'data/token-transfer.out'
    frontendUtil.ensurePath('data');
    console.time('transfertime')
    const num_per_bat=200;
    const total_bats = accounts.length % num_per_bat ===0 ? parseInt(accounts.length / num_per_bat) : parseInt(accounts.length / num_per_bat) + 1 ;

    for(batidx=0;batidx<total_bats;batidx++){
      const totals_per_bat = accounts.length - batidx * num_per_bat>=num_per_bat ? num_per_bat : accounts.length - batidx * num_per_bat ;
      const txs=parseInt(totals_per_bat/2);

      for(i=batidx * num_per_bat;i<batidx * num_per_bat+txs;i++){
        const pk=nets[hre.network.name].accounts[i]
        const RPC_ENDPOINT=nets[hre.network.name].url
        const provider = new ethers.providers.JsonRpcProvider(RPC_ENDPOINT);
        const signer = new ethers.Wallet(pk, provider);

        let fulltx = await signer.populateTransaction({
          to: accounts[i+txs].address,
          value: 1
        });

        const rawtx=await signer.signTransaction(fulltx)

        frontendUtil.writeFile(filename_transfer,rawtx+',\n')
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