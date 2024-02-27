const hre = require("hardhat");
var frontendUtil = require('@arcologynetwork/frontend-util/utils/util') 
const nets = require('../network.json');

/**
 * Creates transactions for minting and transferring tokens using the DSToken contract.
 * @returns {Promise<void>} A promise that resolves when the transactions are created.
 */
async function main() {
    accounts = await ethers.getSigners(); // Get the accounts
    const filename_mint = 'data/dstoken-mint.out' // The file to which the mint transactions will be written
    const filename_transfer = 'data/dstoken-transfer.out' // The file to which the transfer transactions will be written
 
    const token_factory = await ethers.getContractFactory("DSToken"); // DSToken is the contract name
    const dstoken = await token_factory.deploy('ACL'); // ACL is the symbol of the token
    await dstoken.deployed(); // Wait for the contract to be deployed
    console.log(`Deployed DsToken at ${dstoken.address}`)

    // Create the transactions for minting.
    console.time('minttime')
    const pk=nets[hre.network.name].accounts[0]
    for(i=0;i<accounts.length;i++){
      const tx = await dstoken.populateTransaction.mint(accounts[i].address,10);
      
      const RPC_ENDPOINT=nets[hre.network.name].url
      const provider = new ethers.providers.JsonRpcProvider(RPC_ENDPOINT);
      const signer = new ethers.Wallet(pk, provider);
      const fulltx=await signer.populateTransaction(tx)
      const rawtx=await signer.signTransaction(fulltx)

      frontendUtil.writeFile(filename_mint,rawtx+',\n') // Write the transaction to the file
    }
    console.timeEnd('minttime')

    // Create the transactions for transferring.
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

        frontendUtil.writeFile(filename_transfer,rawtx+',\n') // Write the transaction to the file
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