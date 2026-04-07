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
    const bt_factory = await ethers.getContractFactory("CumulativeOutofRange");
    const bt = await bt_factory.deploy({nonce:nextnonce});
    await bt.deployed();
    console.log(`Deployed CumulativeOutofRange Test at ${bt.address}`)

    console.log('======start executing TXs calling add======')
    txs=new Array();
    for(i=1;i<=3;i++){
      nextnonce=cliUtil.getNonce(nonceManage,accounts[i].address)
      txs.push(cliUtil.generateTx(function([bt,from,val,nextnonce]){
        return bt.connect(from).add({nonce:nextnonce});
      },bt,accounts[i],i,nextnonce));
    }
    await cliUtil.waitingTxs(txs);
    expect(await bt.getCounter()).to.equal(1);
  }


  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });