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

    console.log('======start deploying contract======')
    var proposals= new Array();
    proposals.push(hre.ethers.utils.formatBytes32String("Alice"));
    proposals.push(hre.ethers.utils.formatBytes32String("Bob"));

    nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
    const Vote_factory = await ethers.getContractFactory("Ballot");
    const vote = await Vote_factory.deploy(proposals,{nonce:nextnonce});
    await vote.deployed();
    cliUtil.getNonce(nonceManage,accounts[0].address)
    console.log(`Deployed vote at ${vote.address}`)

    console.log('======start executing TXs calling add======')
    var txs=new Array();
    for(i=1;i<=2;i++){
      nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
      txs.push(cliUtil.generateTx(function([visitCounter,from,nextnonce]){
        return visitCounter.connect(from).add(i,{nonce:nextnonce});
      },visitCounter,accounts[i],nextnonce));
    }
    await cliUtil.waitingTxs(txs);
    // const transamt = BigInt(await visitCounter.iCount());

    console.log('======start executing TXs calling add======')
    txs=new Array();
    for(i=1;i<=2;i++){
      nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
      txs.push(cliUtil.generateTx(function([visitCounter,from,nextnonce]){
        return visitCounter.connect(from).add(i,{nonce:nextnonce});
      },visitCounter,accounts[i],nextnonce));
    }
    await cliUtil.waitingTxs(txs);
    transamt = BigInt(await visitCounter.iCount());
    console.log(transamt);

    console.log('======start executing TXs calling add======')
    var txs=new Array();
    for(i=1;i<=3;i++){
      nonce=cliUtil.getNonce(nonceManage,accounts[i].address)
      txs.push(cliUtil.generateTx(function([visitCounter,from,nextnonce]){
        return visitCounter.connect(from).add(i,{nonce:nextnonce});
      },visitCounter,accounts[i],nonce));
    }
    for(i=4;i<=4;i++){
          nonce=cliUtil.getNonce(nonceManage,accounts[0].address)
          txs.push(cliUtil.generateTx(function([contract,addr,nextnonce]){
            return contract.giveRightToVote(addr.address,{nonce:nextnonce});
          },vote,accounts[i],nonce));
    }
    await cliUtil.waitingTxs(txs);
    const result = await visitCounter.iCount();
    console.log(result);
    expect(result).to.equal(transamt+BigInt(6));

  }

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });