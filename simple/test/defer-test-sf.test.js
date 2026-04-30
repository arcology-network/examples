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
    const bt_factory = await ethers.getContractFactory("DeferTest");
    const bt = await bt_factory.deploy({nonce:nextnonce});
    await bt.deployed();
    console.log(`Deployed DeferTest Test at ${bt.address}`)

    console.log('======start executing TXs calling pvisit first bat======')
    var txs=new Array();
    for(i=1;i<=3;i++){
      nextnonce=cliUtil.getNonce(nonceManage,accounts[i].address)
      txs.push(cliUtil.generateTx(function([bt,from,val,nextnonce]){
        const params = {
          parallel: 1,                
          defer: 0                 
        };
        return bt.connect(from).pvisit(params,{nonce:nextnonce});
      },bt,accounts[i],i,nextnonce));
    }
    await cliUtil.waitingTxs(txs);

    nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
    tx = await bt.getCounter({nonce:nextnonce});
    let receipt=await tx.wait();
    let count=cliUtil.parseEvent(receipt,bt,"CounterQuery");
    let sum=await bt.getSum();
    console.log(`count ${count} sum ${sum}`);
    expect(count == 2 ||  sum == 0).to.be.true;

    console.log('======start executing TXs calling pvisit first bat======')
    txs=new Array();
    for(i=1;i<=3;i++){
      nextnonce=cliUtil.getNonce(nonceManage,accounts[i].address)
      txs.push(cliUtil.generateTx(function([bt,from,val,nextnonce]){
        const params = {
          parallel: 1,                
          defer: 1                 
        };
        return bt.connect(from).pvisit(params,{nonce:nextnonce});
      },bt,accounts[i],i,nextnonce));
    }
    await cliUtil.waitingTxs(txs);

    nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
    tx = await bt.getCounter({nonce:nextnonce});
    receipt=await tx.wait();

    count=cliUtil.parseEvent(receipt,bt,"CounterQuery");
    sum=await bt.getSum();

    expect(count == 3 ||  sum == 3).to.be.true;
    console.log(`count ${count} sum ${sum}`);

  }


  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });