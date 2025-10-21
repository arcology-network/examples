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

    console.log('======start executing TXs calling pvisit first bat======')
    var txs=new Array();
    for(i=1;i<=3;i++){
      txs.push(frontendUtil.generateTx(function([bt,from,val]){
        const params = {
          seed: val,                
          sd: 1                 
        };
        return bt.connect(from).pvisit(params);
      },bt,accounts[i],i));
    }
    await frontendUtil.waitingTxs(txs);
    expect(await bt.getCounter()).to.equal(3);


    console.log('======start executing TXs calling pvisit second bat======')
    txs=new Array();
    for(i=4;i<=6;i++){
      txs.push(frontendUtil.generateTx(function([bt,from,val]){
        const params = {
          seed: val,                
          sd: 1                 
        };
        return bt.connect(from).pvisit(params);
      },bt,accounts[i],i));
    }
    await frontendUtil.waitingTxs(txs); 
    expect(await bt.getCounter()).to.equal(6);

    console.log('======start executing TXs calling pvisit third bat======')
    txs=new Array();
    for(i=7;i<=9;i++){
      txs.push(frontendUtil.generateTx(function([bt,from,val]){
        const params = {
          seed: val,                
          sd: 1                 
        };
        return bt.connect(from).pvisit(params);
      },bt,accounts[i],i));
    }
    for(i=10;i<=10;i++){
      txs.push(frontendUtil.generateTx(function([bt,from,val]){
        const params = {
          seed: val,                
          sd: 0                 
        };
        return bt.connect(from).pvisit(params);
      },bt,accounts[i],i));
    }

    await frontendUtil.waitingTxs(txs);
    const result = await bt.getCounter();
    expect(result == 6 || result == 9 || result == 13).to.be.true;
  }

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });