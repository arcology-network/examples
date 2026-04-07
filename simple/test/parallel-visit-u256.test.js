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
    const bt_factory = await ethers.getContractFactory("VisitsU256");
    const bt = await bt_factory.deploy({nonce:nextnonce});
    await bt.deployed();
    console.log(`Deployed Bool Test at ${bt.address}`)

    console.log('======start executing TXs calling visit======')
    var txs=new Array();
    for(i=1;i<=10;i++){
      nextnonce=cliUtil.getNonce(nonceManage,accounts[i].address)
      txs.push(cliUtil.generateTx(function([bt,from,nextnonce]){
        return bt.connect(from).visit({nonce:nextnonce});
      },bt,accounts[i],nextnonce));
    }
    await cliUtil.waitingTxs(txs);
    
    console.log('======start executing TXs calling getCounter======')
    nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
    tx = await bt.getCounter({nonce:nextnonce});
    const receipt=await tx.wait();
    expect(Number(cliUtil.parseEvent(receipt,bt,"CounterQuery"))).to.equal(10);

  }

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });