const hre = require("hardhat");
var ptool = require('@arcologynetwork/benchmarktools/tools') 

async function main() {

    accounts = await ethers.getSigners(); 

    const visit_factory = await ethers.getContractFactory("VisitCounter");
    const visitCounter = await visit_factory.deploy();
    await visitCounter.deployed();
    console.log(`Deployed visitCounter at ${visitCounter.address}`)

    

    console.log('===========visit=====================')

    var txs=new Array();
    for(i=1;i<=10;i++){
      txs.push(ptool.generateTx(function([visitCounter,from]){
        return visitCounter.connect(from).visit();
      },visitCounter,accounts[i]));
    }
    await ptool.waitingTxs(txs);
    
    console.log('===========getCounter=====================')
    
    tx = await visitCounter.getCounter();
    const receipt=await tx.wait();
    ptool.showResult(ptool.parseReceipt(receipt));
    if(ptool.parseEvent(receipt,"CounterQuery")==="0x000000000000000000000000000000000000000000000000000000000000000a"){
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