const hre = require("hardhat");
var frontendUtil = require('@arcologynetwork/frontend-util/utils/util')

async function main() {
    accounts = await ethers.getSigners(); 

    const visit_factory = await ethers.getContractFactory("VisitCounter");
    const visitCounter = await visit_factory.deploy();
    await visitCounter.deployed();
    console.log(`Deployed visitCounter at ${visitCounter.address}`)

    let receipt
    console.log('===========visit=====================')
    var txs=new Array();
    for(i=1;i<=10;i++){
      txs.push(frontendUtil.generateTx(function([visitCounter,from]){
        return visitCounter.connect(from).visit(i);
      },visitCounter,accounts[i]));
    }


    await frontendUtil.waitingTxs(txs);
    
    console.log('===========getCounter=====================')
    tx = await visitCounter.getCounter();
    receipt=await tx.wait();
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
    console.log(`Visit counter Data ${frontendUtil.parseEvent(receipt,"CounterQuery")}`);
    if(frontendUtil.parseEvent(receipt,"CounterQuery")==="0x0000000000000000000000000000000000000000000000000000000000000037"){
      console.log('Test Successful');
    }else{
      console.log('Test Failed');
    } 

    console.log('===========second visit=====================')
    txs=new Array();
    for(i=1;i<=10;i++){
      txs.push(frontendUtil.generateTx(function([visitCounter,from]){
        return visitCounter.connect(from).visit(i);
      },visitCounter,accounts[i]));
    }
    await frontendUtil.waitingTxs(txs);
    console.log('===========getCounter=====================')
    tx = await visitCounter.getCounter();
    receipt=await tx.wait();
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
    console.log(`Visit counter Data ${frontendUtil.parseEvent(receipt,"CounterQuery")}`);
    if(frontendUtil.parseEvent(receipt,"CounterQuery")==="0x000000000000000000000000000000000000000000000000000000000000006e"){
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