const hre = require("hardhat");
var frontendUtil = require('@arcologynetwork/frontend-util/utils/util')
const nets = require('../network.json');

async function main() {
    accounts = await ethers.getSigners(); 

    console.log('======start deploying contract======')
    const counter_factory = await ethers.getContractFactory("BoundedCounter");
    const counter = await counter_factory.deploy();
    await counter.deployed();
    console.log(`Deployed Counter Test at ${counter.address}`)
    
    var txs=new Array();
    let i,tx,receipt;
   
    console.log('======start executing TXs calling add======')
    tx = await counter.add(10);
    receipt=await tx.wait();
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
    console.log(frontendUtil.parseEvent(receipt,"QueryBalance"))
    if(frontendUtil.parseEvent(receipt,"QueryBalance")==="0x000000000000000000000000000000000000000000000000000000000000000a"){
      console.log('Test Successful');
    }else{
      console.log('Test Failed');
    }

    console.log('======start executing TXs calling sub======')
    tx = await counter.sub(5);
    receipt=await tx.wait();
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
    console.log(frontendUtil.parseEvent(receipt,"QueryBalance"))
    if(frontendUtil.parseEvent(receipt,"QueryBalance")==="0x0000000000000000000000000000000000000000000000000000000000000005"){
      console.log('Test Successful');
    }else{
      console.log('Test Failed');
    }

    console.log('======start executing TXs calling reset======')
    tx = await counter.reset();
    receipt=await tx.wait();
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
    console.log(frontendUtil.parseEvent(receipt,"QueryBalance"))
    if(frontendUtil.parseEvent(receipt,"QueryBalance")==="0x0000000000000000000000000000000000000000000000000000000000000000"){
      console.log('Test Successful');
    }else{
      console.log('Test Failed');
    }
}

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });