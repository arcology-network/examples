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
    const counter_factory = await ethers.getContractFactory("BoundedCounter");
    const counter = await counter_factory.deploy({nonce:nextnonce});
    await counter.deployed();
    console.log(`Deployed Counter Test at ${counter.address}`)
    
    var txs=new Array();
    let i,tx,receipt;
   
    console.log('======start executing TXs calling add======')
    nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
    tx = await counter.add(10,{nonce:nextnonce});
    receipt=await tx.wait();
    cliUtil.showResult(cliUtil.parseReceipt(receipt));
    expect(Number(cliUtil.parseEvent(receipt,counter,"QueryBalance"))).to.equal(10);

    console.log('======start executing TXs calling sub======')
    nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
    tx = await counter.sub(5,{nonce:nextnonce});
    receipt=await tx.wait();
    expect(Number(cliUtil.parseEvent(receipt,counter,"QueryBalance"))).to.equal(5);


    console.log('======start executing TXs calling reset======')
    nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
    tx = await counter.reset({nonce:nextnonce});
    receipt=await tx.wait();
    expect(Number(cliUtil.parseEvent(receipt,counter,"QueryBalance"))).to.equal(0);
   
}

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });