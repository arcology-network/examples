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

    console.log('======start executing TXs calling pvisit first bat======')
    var txs=new Array();
    for(i=1;i<=3;i++){
      nextnonce=cliUtil.getNonce(nonceManage,accounts[i].address)
      txs.push(cliUtil.generateTx(function([bt,from,val,nextnonce]){
        const params = {
          seed: val,                
          sd: 1                 
        };
        return bt.connect(from).pvisit(params,{nonce:nextnonce});
      },bt,accounts[i],i,nextnonce));
    }
    await cliUtil.waitingTxs(txs);
    expect(await bt.getCounter()).to.equal(3);


    console.log('======start executing TXs calling pvisit second bat======')
    txs=new Array();
    for(i=4;i<=6;i++){
      nextnonce=cliUtil.getNonce(nonceManage,accounts[i].address)
      txs.push(cliUtil.generateTx(function([bt,from,val,nextnonce]){
        const params = {
          seed: val,                
          sd: 1                 
        };
        return bt.connect(from).pvisit(params,{nonce:nextnonce});
      },bt,accounts[i],i,nextnonce));
    }
    await cliUtil.waitingTxs(txs); 
    expect(await bt.getCounter()).to.equal(6);

    console.log('======start executing TXs calling pvisit third bat======')
    txs=new Array();
    for(i=7;i<=9;i++){
      nextnonce=cliUtil.getNonce(nonceManage,accounts[i].address)
      txs.push(cliUtil.generateTx(function([bt,from,val,nextnonce]){
        const params = {
          seed: val,                
          sd: 1                 
        };
        return bt.connect(from).pvisit(params,{nonce:nextnonce});
      },bt,accounts[i],i,nextnonce));
    }
    for(i=10;i<=10;i++){
      nextnonce=cliUtil.getNonce(nonceManage,accounts[i].address)
      txs.push(cliUtil.generateTx(function([bt,from,val,nextnonce]){
        const params = {
          seed: val,                
          sd: 0                 
        };
        return bt.connect(from).pvisit(params,{nonce:nextnonce});
      },bt,accounts[i],i,nextnonce));
    }

    await cliUtil.waitingTxs(txs);
    const result = await bt.getCounter();
    console.log(result);
    // expect(result == 6 || result == 9 || result == 13).to.be.true;
    expect(result == 6 ||  result == 14).to.be.true;
  }

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });