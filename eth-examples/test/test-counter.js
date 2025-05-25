const hre = require("hardhat");
var frontendUtil = require('@arcologynetwork/frontend-util/utils/util')

async function main() {
    accounts = await ethers.getSigners(); 

    const visit_factory = await ethers.getContractFactory("Counter");
    const visitCounter = await visit_factory.deploy();
    await visitCounter.deployed();
    console.log(`Deployed Counter at ${visitCounter.address}`)

    console.log('===========add=====================')
    var txs=new Array();
    for(i=1;i<=5;i++){
      txs.push(frontendUtil.generateTx(function([visitCounter,from]){
        return visitCounter.connect(from).add(i);
      },visitCounter,accounts[i]));
    }
    await frontendUtil.waitingTxs(txs);
    
    console.log('===========getCounter=====================')
    tx = await visitCounter.getCounter();
    let receipt=await tx.wait();
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
    let hexStr=frontendUtil.parseEvent(receipt,"CounterQuery")
    console.log(`Counter Data ${hexStr}`)
    let transamt=BigInt(hexStr);

    console.log('===========add=====================')
    var txs=new Array();
    for(i=1;i<=5;i++){
      txs.push(frontendUtil.generateTx(function([visitCounter,from]){
        return visitCounter.connect(from).add(i);
      },visitCounter,accounts[i]));
    }
    await frontendUtil.waitingTxs(txs);
    
    console.log('===========getCounter=====================')
    tx = await visitCounter.getCounter();
    receipt=await tx.wait();
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
    hexStr=frontendUtil.parseEvent(receipt,"CounterQuery")
    console.log(`Counter Data ${hexStr}`)
    if(transamt+BigInt(15)==BigInt(hexStr)){
      console.log("Transaction is Successful");
    }else{
      console.log("Transaction is Failed");
    }
  }

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });