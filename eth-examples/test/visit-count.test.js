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
    const visit_factory = await ethers.getContractFactory("VisitCounter");
    const visitCounter = await visit_factory.deploy({nonce:nextnonce});
    await visitCounter.deployed();
    console.log(`Deployed visitCounter at ${visitCounter.address}`)

    let receipt
    console.log('======start executing TXs calling visit======')
    var txs=new Array();
    for(i=1;i<=10;i++){
      nextnonce=cliUtil.getNonce(nonceManage,accounts[i].address)
      txs.push(cliUtil.generateTx(function([visitCounter,from,nextnonce]){
        return visitCounter.connect(from).visit({nonce:nextnonce});
      },visitCounter,accounts[i],nextnonce));
    }
    await cliUtil.waitingTxs(txs);
    
    console.log('======start executing TXs calling getCounter======')
    nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
    tx = await visitCounter.getCounter({nonce:nextnonce});
    receipt=await tx.wait();
    cliUtil.showResult(cliUtil.parseReceipt(receipt));
    let total=cliUtil.parseEvent(receipt,visitCounter,"CounterQuery");
    console.log(`Visit counter Data ${total}`);
    expect(Number(total)).to.equal(10);

    console.log('======start executing TXs calling visit again======')
    txs=new Array();
    for(i=1;i<=10;i++){
      nextnonce=cliUtil.getNonce(nonceManage,accounts[i].address)
      txs.push(cliUtil.generateTx(function([visitCounter,from,nextnonce]){
        return visitCounter.connect(from).visit({nonce:nextnonce});
      },visitCounter,accounts[i],nextnonce));
    }
    await cliUtil.waitingTxs(txs);

    console.log('======start executing TXs calling getCounter======')
    nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
    tx = await visitCounter.getCounter({nonce:nextnonce});
    receipt=await tx.wait();
    cliUtil.showResult(cliUtil.parseReceipt(receipt));
    total=cliUtil.parseEvent(receipt,visitCounter,"CounterQuery");
    console.log(`Visit counter Data ${total}`);
    expect(Number(total)).to.equal(20);

  }
  
  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });