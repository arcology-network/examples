const hre = require("hardhat");
var frontendUtil = require('@arcologynetwork/frontend-util/utils/util') 

async function main() {
    accounts = await ethers.getSigners(); 

    const bt_factory = await ethers.getContractFactory("Visits");
    const bt = await bt_factory.deploy();
    await bt.deployed();
    console.log(`Deployed Bool Test at ${bt.address}`)

    // addr="0xB1e0e9e68297aAE01347F6Ce0ff21d5f72D3fa0F"
    // const bt = await bt_factory.attach(addr) 

    console.log('===========visit=====================')
    var txs=new Array();
    for(i=1;i<=10;i++){
      txs.push(frontendUtil.generateTx(function([bt,from]){
        return bt.connect(from).visit();
      },bt,accounts[i]));
    }
    await frontendUtil.waitingTxs(txs);
    
    console.log('===========getCounter=====================')
    tx = await bt.getCounter();
    const receipt=await tx.wait();
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
    console.log(frontendUtil.parseEvent(receipt,"CounterQuery"))
    if(frontendUtil.parseEvent(receipt,"CounterQuery")==="0x000000000000000000000000000000000000000000000000000000000000000a"){
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