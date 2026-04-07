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
    const bt_factory = await ethers.getContractFactory("DuoDeferred");
    const bt = await bt_factory.deploy({nonce:nextnonce});
    await bt.deployed();
    console.log(`Deployed DuoDeferred Test at ${bt.address}`)

    let tx,receipt;
    console.log('======first bat,Failed one ,two generations ======')
    //g1:6 g2:2
    var txs=new Array();
    for(i=1;i<=4;i++){
      nextnonce=cliUtil.getNonce(nonceManage,accounts[i].address)
      txs.push(cliUtil.generateTx(function([bt,from,val,nextnonce]){
        const params = {
          seed: val,                
          sd: 1                 
        };
        return bt.connect(from).pvisit(params,{nonce:nextnonce});
      },bt,accounts[i],1,nextnonce));

      nextnonce=cliUtil.getNonce(nonceManage,accounts[i].address)
      txs.push(cliUtil.generateTx(function([bt,from,val,nextnonce]){
        return bt.connect(from).add(val,{nonce:nextnonce});
      },bt,accounts[i],1,nextnonce));
    }
    await cliUtil.waitingTxs(txs);
    expect(await bt.getCounter()).to.equal(4);

    console.log('====== second bat,four generations ======')
    //g1:3 g2:1 g3:3 g4:1
    txs=new Array();
    for(i=5;i<=8;i++){
      nextnonce=cliUtil.getNonce(nonceManage,accounts[i].address)
      txs.push(cliUtil.generateTx(function([bt,from,val,nextnonce]){
        const params = {
          seed: val,                
          sd: 1                 
        };
        return bt.connect(from).pvisit(params,{nonce:nextnonce});
      },bt,accounts[i],1,nextnonce));

      nextnonce=cliUtil.getNonce(nonceManage,accounts[i].address)
      txs.push(cliUtil.generateTx(function([bt,from,val,nextnonce]){
        return bt.connect(from).add(val,{nonce:nextnonce});
      },bt,accounts[i],1,nextnonce));
    }
    await cliUtil.waitingTxs(txs);
    expect(await bt.getCounter()).to.equal(12);

    console.log('====== third bat,four generations ======')
    //g1:1 g2:1 g3:1 g4:1
    txs=new Array();
    for(i=9;i<=10;i++){
      nextnonce=cliUtil.getNonce(nonceManage,accounts[i].address)
      txs.push(cliUtil.generateTx(function([bt,from,val,nextnonce]){
        const params = {
          seed: val,                
          sd: 1                 
        };
        return bt.connect(from).pvisit(params,{nonce:nextnonce});
      },bt,accounts[i],1,nextnonce));

      nextnonce=cliUtil.getNonce(nonceManage,accounts[i].address)
      txs.push(cliUtil.generateTx(function([bt,from,val,nextnonce]){
        return bt.connect(from).add(val,{nonce:nextnonce});
      },bt,accounts[i],1,nextnonce));
    }
    await cliUtil.waitingTxs(txs);
    expect(await bt.getCounter()).to.equal(16);
  }

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });