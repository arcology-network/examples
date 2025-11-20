const hre = require("hardhat");
var frontendUtil = require('@arcologynetwork/frontend-util/utils/util') 
const { expect } = require("chai");

async function main() {
    accounts = await ethers.getSigners(); 

    console.log('======start deploying contract======')
    const bt_factory = await ethers.getContractFactory("DuoDeferred");
    const bt = await bt_factory.deploy();
    await bt.deployed();
    console.log(`Deployed DuoDeferred Test at ${bt.address}`)

    let tx,receipt;
    console.log('======first bat,Failed one ,two generations ======')
    //g1:6 g2:2
    var txs=new Array();
    for(i=1;i<=4;i++){
      txs.push(frontendUtil.generateTx(function([bt,from,val]){
        const params = {
          seed: val,                
          sd: 1                 
        };
        return bt.connect(from).pvisit(params);
      },bt,accounts[i],1));

      txs.push(frontendUtil.generateTx(function([bt,from,val]){
        return bt.connect(from).add(val);
      },bt,accounts[i],1));
    }
    await frontendUtil.waitingTxs(txs);
    expect(await bt.getCounter()).to.equal(4);

    console.log('====== second bat,four generations ======')
    //g1:3 g2:1 g3:3 g4:1
    txs=new Array();
    for(i=5;i<=8;i++){
      txs.push(frontendUtil.generateTx(function([bt,from,val]){
        const params = {
          seed: val,                
          sd: 1                 
        };
        return bt.connect(from).pvisit(params);
      },bt,accounts[i],1));

      txs.push(frontendUtil.generateTx(function([bt,from,val]){
        return bt.connect(from).add(val);
      },bt,accounts[i],1));
    }
    await frontendUtil.waitingTxs(txs);
    expect(await bt.getCounter()).to.equal(12);

    console.log('====== third bat,four generations ======')
    //g1:1 g2:1 g3:1 g4:1
    txs=new Array();
    for(i=9;i<=10;i++){
      txs.push(frontendUtil.generateTx(function([bt,from,val]){
        const params = {
          seed: val,                
          sd: 1                 
        };
        return bt.connect(from).pvisit(params);
      },bt,accounts[i],1));

      txs.push(frontendUtil.generateTx(function([bt,from,val]){
        return bt.connect(from).add(val);
      },bt,accounts[i],1));
    }
    await frontendUtil.waitingTxs(txs);
    expect(await bt.getCounter()).to.equal(16);
  }

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });