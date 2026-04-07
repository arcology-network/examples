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
    const visit_factory = await ethers.getContractFactory("Counter");
    const visitCounter = await visit_factory.deploy({nonce:nextnonce});
    await visitCounter.deployed();
    console.log(`Deployed Counter at ${visitCounter.address}`)

    console.log('======start executing TXs calling add======')
    var txs=new Array();
    for(i=1;i<=5;i++){
      nextnonce=cliUtil.getNonce(nonceManage,accounts[i].address)
      txs.push(cliUtil.generateTx(function([visitCounter,from,nextnonce]){
        return visitCounter.connect(from).add(i,{nonce:nextnonce});
      },visitCounter,accounts[i],nextnonce));
    }
    await cliUtil.waitingTxs(txs);
    const transamt = BigInt(await visitCounter.iCount());

    console.log('======start executing TXs calling add======')
    var txs=new Array();
    for(i=1;i<=5;i++){
      nextnonce=cliUtil.getNonce(nonceManage,accounts[i].address)
      txs.push(cliUtil.generateTx(function([visitCounter,from,nextnonce]){
        return visitCounter.connect(from).add(i,{nonce:nextnonce});
      },visitCounter,accounts[i],nextnonce));
    }
    await cliUtil.waitingTxs(txs);
    expect(await visitCounter.iCount()).to.equal(transamt+BigInt(15));

  }

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });