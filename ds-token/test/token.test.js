const hre = require("hardhat");
var frontendUtil = require('@arcologynetwork/frontend-util/utils/util') 
const { expect } = require("chai");

async function main() {
    
    accounts = await ethers.getSigners(); 

    const token_factory = await ethers.getContractFactory("DSToken");
    const dstoken = await token_factory.deploy('ACL');
    await dstoken.deployed();
    console.log(`Deployed DsToken at ${dstoken.address}`)

    let receipt,i,txs; 

    console.log('===========mint=====================')
    txs=new Array();
    for(i=1;i<=10;i++){
      txs.push(frontendUtil.generateTx(function([dstoken,from,val]){
        return dstoken.mint(from.address,val);
      },dstoken,accounts[i],100+i));
    }
    await frontendUtil.waitingTxs(txs);

    let expectedBalances1 = [101, 102, 103, 104, 105, 106, 107, 108];
    for (let i = 1; i <= 8; i++) {
      tx = await dstoken.balance(accounts[i].address);
      receipt=await tx.wait();
      expect(Number(frontendUtil.parseEvent(receipt,dstoken,"Balance"))).to.equal(expectedBalances1[i - 1]);
    }

    console.log('===========transfer=====================')
    txs=new Array();
    for(i=1;i<=4;i++){
      txs.push(frontendUtil.generateTx(function([dstoken,from,to,val]){
        return dstoken.connect(from).transfer(to.address,val);
      },dstoken,accounts[i],accounts[i+4],100+i));
    }
    await frontendUtil.waitingTxs(txs);

    let expectedBalances2 = [0, 0, 0, 0, 206, 208, 210, 212];
    for (let i = 1; i <= 8; i++) {
      tx = await dstoken.balance(accounts[i].address);
      receipt=await tx.wait();
      expect(Number(frontendUtil.parseEvent(receipt,dstoken,"Balance"))).to.equal(expectedBalances2[i - 1]);
    }
    
    console.log('===========approve=====================')
    txs=new Array();
    for(i=1;i<=4;i++){
      txs.push(frontendUtil.generateTx(function([dstoken,from,owner]){
        return dstoken.connect(from).approves(owner.address);
      },dstoken,accounts[i+4],accounts[0]));
    }
    await frontendUtil.waitingTxs(txs);

    console.log('===========burn=====================')
    txs=new Array();
    for(i=1;i<=4;i++){
      txs.push(frontendUtil.generateTx(function([dstoken,from,val]){
        return dstoken.burn(from.address,val);
      },dstoken,accounts[i+4],100+i));
    }
    await frontendUtil.waitingTxs(txs);

    // // transfer from one to five accounts
    console.log('===========mint=====================')
    txs=new Array();
    for(i=1;i<=1;i++){
      txs.push(frontendUtil.generateTx(function([dstoken,from,val]){
        return dstoken.mint(from.address,val);
      },dstoken,accounts[i],50));
    }
    await frontendUtil.waitingTxs(txs);

    tx = await dstoken.balance(accounts[1].address);
    receipt=await tx.wait();
    expect(Number(frontendUtil.parseEvent(receipt,dstoken,"Balance"))).to.equal(50);

    console.log('===========transfer=====================')
    txs=new Array();
    for(i=6;i<=8;i++){
      txs.push(frontendUtil.generateTx(function([dstoken,from,to,val]){
        return dstoken.connect(from).transfer(to.address,val);
      },dstoken,accounts[1],accounts[i],20));
    }
    await frontendUtil.waitingTxs(txs);

    tx = await dstoken.balance(accounts[1].address);
    receipt=await tx.wait();
    expect(Number(frontendUtil.parseEvent(receipt,dstoken,"Balance"))).to.equal(30);
  }

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });