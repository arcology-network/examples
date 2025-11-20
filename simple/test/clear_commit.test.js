const hre = require("hardhat");
var frontendUtil = require('@arcologynetwork/frontend-util/utils/util') 
const { expect } = require("chai");

async function main() {
    accounts = await ethers.getSigners(); 

    console.log('======start deploying contract======')
    const bt_factory = await ethers.getContractFactory("ClearCommit");
    const bt = await bt_factory.deploy();
    await bt.deployed();
    console.log(`Deployed ClearCommit Test at ${bt.address}`)

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

  }


  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });