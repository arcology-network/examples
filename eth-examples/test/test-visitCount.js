const hre = require("hardhat");
var frontendUtil = require('@arcologynetwork/frontend-util/utils/util')

async function main() {
    accounts = await ethers.getSigners(); 

    console.log('======start deploying contract======')
    const visit_factory = await ethers.getContractFactory("VisitCounter");
    const visitCounter = await visit_factory.deploy();
    await visitCounter.deployed();
    console.log(`Deployed visitCounter at ${visitCounter.address}`)

    let receipt
    console.log('======start executing TXs calling visit======')
    var txs=new Array();
    for(i=1;i<=10;i++){
      txs.push(frontendUtil.generateTx(function([visitCounter,from]){
        return visitCounter.connect(from).visit();
      },visitCounter,accounts[i]));
    }
    await frontendUtil.waitingTxs(txs);
    
    console.log('======start executing TXs calling getCounter======')
    tx = await visitCounter.getCounter();
    receipt=await tx.wait();
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
    let total=frontendUtil.parseEvent(receipt,visitCounter,"CounterQuery");
    console.log(`Visit counter Data ${total}`);
    if(Number(total)===10){
      console.log("✅ Test Successful");
    }else{
      console.log("❌ Test Failed");
    } 

    console.log('======start executing TXs calling visit again======')
    txs=new Array();
    for(i=1;i<=10;i++){
      txs.push(frontendUtil.generateTx(function([visitCounter,from]){
        return visitCounter.connect(from).visit();
      },visitCounter,accounts[i]));
    }
    await frontendUtil.waitingTxs(txs);

    console.log('======start executing TXs calling getCounter======')
    tx = await visitCounter.getCounter();
    receipt=await tx.wait();
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
    total=frontendUtil.parseEvent(receipt,visitCounter,"CounterQuery");
    console.log(`Visit counter Data ${total}`);
    if(Number(total)===20){
      console.log("✅ Test Successful");
    }else{
      console.log("❌ Test Failed");
    }
  }
  
  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });