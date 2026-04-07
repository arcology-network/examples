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
    const cum_factory = await ethers.getContractFactory("HashCum");
    const cum = await cum_factory.deploy({nonce:nextnonce});
    await cum.deployed();
    console.log(`Deployed HashCum Test at ${cum.address}`)

    var txs=new Array();
    let i,tx,receipt;

    console.log('======start executing TXs calling insert======')
    for(i=1;i<=3;i++){
      nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
      txs.push(cliUtil.generateTx(function([cum,from,val,nextnonce]){
        return cum.insert(from.address,val, {
          gasLimit: 500000000,
          nonce:nextnonce,
        });
      },cum,accounts[0],i,nextnonce));
    }
    await cliUtil.waitingTxs(txs);

    console.log('======start executing TXs calling getBalance for exist======')
    nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
    tx = await cum.getBalance(accounts[0].address,{nonce:nextnonce});
    receipt=await tx.wait();
    expect(Number(cliUtil.parseEvent(receipt,cum,"QueryBalance"))).to.equal(6);

    console.log('======start executing TXs calling getBalance for not exist======')
    nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
    tx = await cum.getBalance(accounts[1].address,{nonce:nextnonce});
    receipt=await tx.wait();
    cliUtil.showResult(cliUtil.parseReceipt(receipt));
    console.log(`Balance Data ${cliUtil.parseEvent(receipt,cum,"QueryBalance")}`);
}


  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });