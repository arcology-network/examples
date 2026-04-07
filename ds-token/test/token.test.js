const hre = require("hardhat");
var cliUtil = require('@arcologynetwork/cli-util/utils/util') 
const { expect } = require("chai");


async function main() {
    accounts = await ethers.getSigners(); 

    const {rpcUrl,pks}=cliUtil.parseNetworkV2(hre)
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const nonceManage=await cliUtil.InitNonces(pks,provider)

    let nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
    const token_factory = await ethers.getContractFactory("DSToken");
    const dstoken = await token_factory.deploy('ACL',{nonce:nextnonce});
    await dstoken.deployed();
    console.log(`Deployed DsToken at ${dstoken.address}`)

    let receipt,i,txs; 

    console.log('===========mint=====================')
    txs=new Array();
    for(i=1;i<=10;i++){
      nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
      txs.push(cliUtil.generateTx(function([dstoken,from,val,nextnonce]){
        return dstoken.mint(from.address,val,{nonce:nextnonce});
      },dstoken,accounts[i],100+i,nextnonce));
    }
    await cliUtil.waitingTxs(txs);

    let expectedBalances1 = [101, 102, 103, 104, 105, 106, 107, 108];
    for (let i = 1; i <= 8; i++) {
      nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
      tx = await dstoken.balance(accounts[i].address,{nonce:nextnonce});
      receipt=await tx.wait();
      expect(Number(cliUtil.parseEvent(receipt,dstoken,"Balance"))).to.equal(expectedBalances1[i - 1]);
    }

    console.log('===========transfer=====================')
    txs=new Array();
    for(i=1;i<=4;i++){
      nextnonce=cliUtil.getNonce(nonceManage,accounts[i].address)
      txs.push(cliUtil.generateTx(function([dstoken,from,to,val,nextnonce]){
        return dstoken.connect(from).transfer(to.address,val,{nonce:nextnonce});
      },dstoken,accounts[i],accounts[i+4],100+i,nextnonce));
    }
    await cliUtil.waitingTxs(txs);

    let expectedBalances2 = [0, 0, 0, 0, 206, 208, 210, 212];
    for (let i = 1; i <= 8; i++) {
      nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
      tx = await dstoken.balance(accounts[i].address,{nonce:nextnonce});
      receipt=await tx.wait();
      expect(Number(cliUtil.parseEvent(receipt,dstoken,"Balance"))).to.equal(expectedBalances2[i - 1]);
    }
    
    console.log('===========approve=====================')
    txs=new Array();
    for(i=1;i<=4;i++){
      nextnonce=cliUtil.getNonce(nonceManage,accounts[i].address)
      txs.push(cliUtil.generateTx(function([dstoken,from,owner,nextnonce]){
        return dstoken.connect(from).approves(owner.address,{nonce:nextnonce});
      },dstoken,accounts[i+4],accounts[0],nextnonce));
    }
    await cliUtil.waitingTxs(txs);

    console.log('===========burn=====================')
    txs=new Array();
    for(i=1;i<=4;i++){
      nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
      txs.push(cliUtil.generateTx(function([dstoken,from,val,nextnonce]){
        return dstoken.burn(from.address,val,{nonce:nextnonce});
      },dstoken,accounts[i+4],100+i,nextnonce));
    }
    await cliUtil.waitingTxs(txs);

    // // transfer from one to five accounts
    console.log('===========mint=====================')
    txs=new Array();
    for(i=1;i<=1;i++){
      nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
      txs.push(cliUtil.generateTx(function([dstoken,from,val,nextnonce]){
        return dstoken.mint(from.address,val,{nonce:nextnonce});
      },dstoken,accounts[i],50,nextnonce));
    }
    await cliUtil.waitingTxs(txs);

    nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
    tx = await dstoken.balance(accounts[1].address,{nonce:nextnonce});
    receipt=await tx.wait();
    expect(Number(cliUtil.parseEvent(receipt,dstoken,"Balance"))).to.equal(50);

    console.log('===========transfer=====================')
    txs=new Array();
    for(i=6;i<=8;i++){
      nextnonce=cliUtil.getNonce(nonceManage,accounts[i].address)
      txs.push(cliUtil.generateTx(function([dstoken,from,to,val,nextnonce]){
        return dstoken.connect(from).transfer(to.address,val,{nonce:nextnonce});
      },dstoken,accounts[1],accounts[i],20,nextnonce));
    }
    await cliUtil.waitingTxs(txs);

    nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
    tx = await dstoken.balance(accounts[1].address,{nonce:nextnonce});
    receipt=await tx.wait();
    expect(Number(cliUtil.parseEvent(receipt,dstoken,"Balance"))).to.equal(30);
  }

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });