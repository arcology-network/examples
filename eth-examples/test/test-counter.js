const hre = require("hardhat");
var frontendUtil = require('@arcologynetwork/frontend-util/utils/util')
const { expect } = require("chai");

async function main() {
    accounts = await ethers.getSigners(); 

    console.log('======start deploying contract======')
    const visit_factory = await ethers.getContractFactory("Counter");
    const visitCounter = await visit_factory.deploy();
    await visitCounter.deployed();
    console.log(`Deployed Counter at ${visitCounter.address}`)

    console.log('======start executing TXs calling add======')
    var txs=new Array();
    for(i=1;i<=5;i++){
      txs.push(frontendUtil.generateTx(function([visitCounter,from]){
        return visitCounter.connect(from).add(i);
      },visitCounter,accounts[i]));
    }
    await frontendUtil.waitingTxs(txs);
    const transamt = BigInt(await visitCounter.iCount());

    console.log('======start executing TXs calling add======')
    var txs=new Array();
    for(i=1;i<=5;i++){
      txs.push(frontendUtil.generateTx(function([visitCounter,from]){
        return visitCounter.connect(from).add(i);
      },visitCounter,accounts[i]));
    }
    await frontendUtil.waitingTxs(txs);
    
    expect(await visitCounter.iCount()).to.equal(transamt+BigInt(15));

  }

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });