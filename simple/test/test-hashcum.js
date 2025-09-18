const hre = require("hardhat");
var frontendUtil = require('@arcologynetwork/frontend-util/utils/util')
const nets = require('../network.json');
async function main() {
    accounts = await ethers.getSigners(); 

    console.log('======start deploying contract======')
    const cum_factory = await ethers.getContractFactory("HashCum");
    const cum = await cum_factory.deploy();
    await cum.deployed();
    console.log(`Deployed HashCum Test at ${cum.address}`)

    var txs=new Array();
    let i,tx,receipt;

    console.log('======start executing TXs calling insert======')
    for(i=1;i<=3;i++){
      txs.push(frontendUtil.generateTx(function([cum,from,val]){
        return cum.insert(from.address,val, {
          gasLimit: 500000000,
        });
      },cum,accounts[0],i));
    }
    await frontendUtil.waitingTxs(txs);

    console.log('======start executing TXs calling getBalance for exist======')
    tx = await cum.getBalance(accounts[0].address);
    receipt=await tx.wait();
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
    console.log(frontendUtil.parseEvent(receipt,"QueryBalance"))
    if(frontendUtil.parseEvent(receipt,"QueryBalance")==="0x0000000000000000000000000000000000000000000000000000000000000006"){
      console.log('Test Successful');
    }else{
      console.log('Test Failed');
    }

    console.log('======start executing TXs calling getBalance for not exist======')
    tx = await cum.getBalance(accounts[1].address);
    receipt=await tx.wait();
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
    console.log(frontendUtil.parseEvent(receipt,"QueryBalance"))
}


  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });