const hre = require("hardhat");
var frontendUtil = require('@arcologynetwork/frontend-util/utils/util') 

async function main() {
    accounts = await ethers.getSigners(); 

    console.log('======start deploying contract======')
    const bt_factory = await ethers.getContractFactory("Like");
    const bt = await bt_factory.deploy();
    await bt.deployed();
    console.log(`Deployed Like Test at ${bt.address}`)

    console.log('======start executing TXs calling like======')
    var txs=new Array();
    for(i=1;i<=10;i++){
      txs.push(frontendUtil.generateTx(function([bt,from]){
        return bt.connect(from).like();
      },bt,accounts[i]));
    }
    await frontendUtil.waitingTxs(txs);
    
    console.log('======get total links======')
    tx = await bt.getLikes();
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