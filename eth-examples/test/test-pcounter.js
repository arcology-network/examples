const hre = require("hardhat");
var frontendUtil = require('@arcologynetwork/frontend-util/utils/util')

async function main() {
    accounts = await ethers.getSigners(); 

    console.log('======start deploying contract======')
    const pcounter_factory = await ethers.getContractFactory("ParallelCounter");
    const pcounter = await pcounter_factory.deploy();
    await pcounter.deployed();
    console.log(`Deployed Parallel Counter at ${pcounter.address}`)

    console.log('======start executing TXs calling add1 with conflict======')
    var txs=new Array();
    for(i=1;i<=2;i++){
      txs.push(frontendUtil.generateTx(function([pcounter,from]){
        return pcounter.connect(from).add1(i);
      },pcounter,accounts[i]));
    }
    await frontendUtil.waitingTxs(txs);
    
    console.log('======start executing TXs calling getCounter======')
    tx = await pcounter.getCounter(1);
    let receipt=await tx.wait();
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
    console.log(`Counter Data ${frontendUtil.parseEvent(receipt,pcounter,"CounterQuery")}`)
    
    console.log('======start executing TXs calling reset======')
    tx = await pcounter.reset();
    receipt=await tx.wait();
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));  

    console.log('======start executing TXs calling add1 and add2======')
    var txs=new Array();
    for(i=1;i<=2;i++){
      txs.push(frontendUtil.generateTx(function([pcounter,from]){
        return pcounter.connect(from).add1(i);
      },pcounter,accounts[i]));
    }
    for(i=3;i<=4;i++){
      txs.push(frontendUtil.generateTx(function([pcounter,from]){
        return pcounter.connect(from).add2(i);
      },pcounter,accounts[i]));
    }
    await frontendUtil.waitingTxs(txs);
    
    console.log('======start executing TXs calling getCounter======')
    tx = await pcounter.getCounter(1);
    receipt=await tx.wait();
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
    const num1=Number(frontendUtil.parseEvent(receipt,pcounter,"CounterQuery"));

    tx = await pcounter.getCounter(2);
    receipt=await tx.wait();
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
    const num2=Number(frontendUtil.parseEvent(receipt,pcounter,"CounterQuery"));

    tx = await pcounter.getCounter(3);
    receipt=await tx.wait();
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
    const num3=Number(frontendUtil.parseEvent(receipt,pcounter,"CounterQuery"));

    console.log(`Counter Data ${num1},${num2},${num3}`)
    if(num1===3 && num2===10 && num3===7){
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