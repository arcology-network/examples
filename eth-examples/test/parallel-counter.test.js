const hre = require("hardhat");
var cliUtil = require('@arcologynetwork/cli-util/utils/util')
const { expect } = require("chai");

async function main() {
    accounts = await ethers.getSigners(); 
    
    const {rpcUrl,pks}=cliUtil.parseNetworkV2(hre)
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const nonceManage=await cliUtil.InitNonces(pks,provider)

    console.log('======start deploying contract======')
    let nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
    const pcounter_factory = await ethers.getContractFactory("ParallelCounter");
    const pcounter = await pcounter_factory.deploy({nonce:nextnonce});
    await pcounter.deployed();
    console.log(`Deployed Parallel Counter at ${pcounter.address}`)

    console.log('======start executing TXs calling add1 with conflict======')
    var txs=new Array();
    for(i=1;i<=2;i++){
      nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
      txs.push(cliUtil.generateTx(function([pcounter,from,nextnonce]){
        return pcounter.connect(from).add1(i,{nonce:nextnonce});
      },pcounter,accounts[i],nextnonce));
    }
    await cliUtil.waitingTxs(txs);
    
    console.log('======start executing TXs calling getCounter======')
    nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
    tx = await pcounter.getCounter(1,{nonce:nextnonce});
    let receipt=await tx.wait();
    cliUtil.showResult(cliUtil.parseReceipt(receipt));
    console.log(`Counter Data ${cliUtil.parseEvent(receipt,pcounter,"CounterQuery")}`)
    
    console.log('======start executing TXs calling reset======')
    nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
    tx = await pcounter.reset({nonce:nextnonce});
    receipt=await tx.wait();
    cliUtil.showResult(cliUtil.parseReceipt(receipt));  

    console.log('======start executing TXs calling add1 and add2======')
    var txs=new Array();
    for(i=1;i<=2;i++){
      nextnonce=cliUtil.getNonce(nonceManage,accounts[i].address)
      txs.push(cliUtil.generateTx(function([pcounter,from,nextnonce]){
        return pcounter.connect(from).add1(i,{nonce:nextnonce});
      },pcounter,accounts[i],nextnonce));
    }
    for(i=3;i<=4;i++){
      nextnonce=cliUtil.getNonce(nonceManage,accounts[i].address)
      txs.push(cliUtil.generateTx(function([pcounter,from,nextnonce]){
        return pcounter.connect(from).add2(i,{nonce:nextnonce});
      },pcounter,accounts[i],nextnonce));
    }
    await cliUtil.waitingTxs(txs);
    
    console.log('======start executing TXs calling getCounter======')
    nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
    tx = await pcounter.getCounter(1,{nonce:nextnonce});
    receipt=await tx.wait();
    cliUtil.showResult(cliUtil.parseReceipt(receipt));
    const num1=Number(cliUtil.parseEvent(receipt,pcounter,"CounterQuery"));

    nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
    tx = await pcounter.getCounter(2,{nonce:nextnonce});
    receipt=await tx.wait();
    cliUtil.showResult(cliUtil.parseReceipt(receipt));
    const num2=Number(cliUtil.parseEvent(receipt,pcounter,"CounterQuery"));

    nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
    tx = await pcounter.getCounter(3,{nonce:nextnonce});
    receipt=await tx.wait();
    cliUtil.showResult(cliUtil.parseReceipt(receipt));
    const num3=Number(cliUtil.parseEvent(receipt,pcounter,"CounterQuery"));

    console.log(`Counter Data ${num1},${num2},${num3}`)
    expect(num1).to.equal(3);
    expect(num2).to.equal(10);
    expect(num3).to.equal(7);

  }

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });