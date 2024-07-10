const hre = require("hardhat");
var frontendUtil = require('@arcologynetwork/frontend-util/utils/util')
const nets = require('../network.json');

async function main() {
    accounts = await ethers.getSigners(); 
    const provider = new ethers.providers.JsonRpcProvider(nets[hre.network.name].url);

    const filename = 'data/vendingMachine.out' // The file to which the transactions will be written
    frontendUtil.ensurePath('data');
    const handle=frontendUtil.newFile(filename)
    
    const vending_factory = await ethers.getContractFactory("VendingMachine");
    const vendingMachine = await vending_factory.deploy();
    await vendingMachine.deployed();
    console.log(`Deployed vendingMachine at ${vendingMachine.address}`)
    
    let tx,fulltx,rawtx,pk,signer
    for(i=0;i<accounts.length;i++){
      tx = await vendingMachine.connect(accounts[i]).populateTransaction.purchase(1,{value: ethers.utils.parseEther("1.0")});

      pk=nets[hre.network.name].accounts[i];
      signer = new ethers.Wallet(pk, provider);
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