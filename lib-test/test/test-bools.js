const hre = require("hardhat");
var ptool = require('./tools') 

async function main() {

    accounts = await ethers.getSigners(); 

    const bt_factory = await ethers.getContractFactory("BoolTest");
    const bt = await bt_factory.deploy();
    await bt.deployed();
    console.log(`Deployed Bool Test at ${bt.address}`)

    

    console.log('===========visit=====================')

    var txs=new Array();
    for(i=1;i<=10;i++){
      txs.push(ptool.generateTx(function([bt,from]){
        return bt.connect(from).visit();
      },bt,accounts[i]));
    }
    await ptool.waitingTxs(txs);
    
    console.log('===========getCounter=====================')
    
    tx = await bt.getCounter();
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