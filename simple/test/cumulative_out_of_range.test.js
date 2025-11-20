const hre = require("hardhat");
var frontendUtil = require('@arcologynetwork/frontend-util/utils/util') 
const { expect } = require("chai");

async function main() {
    accounts = await ethers.getSigners(); 

    console.log('======start deploying contract======')
    const bt_factory = await ethers.getContractFactory("CumulativeOutofRange");
    const bt = await bt_factory.deploy();
    await bt.deployed();
    console.log(`Deployed CumulativeOutofRange Test at ${bt.address}`)

    console.log('======start executing TXs calling add======')
    txs=new Array();
    for(i=1;i<=3;i++){
      txs.push(frontendUtil.generateTx(function([bt,from,val]){
        return bt.connect(from).add();
      },bt,accounts[i],i));
    }
    await frontendUtil.waitingTxs(txs);
    expect(await bt.getCounter()).to.equal(1);
  }


  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });