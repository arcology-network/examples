const hre = require("hardhat");
var ptool = require('@arcologynetwork/concurrentlib/js/tools') 

async function main() {

    accounts = await ethers.getSigners(); 

    const visit_factory = await ethers.getContractFactory("VisitCounter");
    const visitCounter = await visit_factory.deploy();
    await visitCounter.deployed();
    console.log(`Deployed visitCounter at ${visitCounter.address}`)

    const Vote_factory = await ethers.getContractFactory("Ballot");
    var proposals= new Array();
    proposals.push(hre.ethers.utils.formatBytes32String("Alice"));
    proposals.push(hre.ethers.utils.formatBytes32String("Bob"));

    const vote = await Vote_factory.deploy(proposals);
    await vote.deployed();
    console.log(`Deployed vote at ${vote.address}`)

    const coin_factory = await ethers.getContractFactory("SubCoin");
    const coin = await coin_factory.deploy();
    await coin.deployed();
    console.log(`Deployed SubCoin at ${coin.address}`)


    console.log('===========first batch=====================')
    var txs=new Array();
    for(i=1;i<=3;i++){
      txs.push(ptool.generateTx(function([contract,addr]){
        return contract.giveRightToVote(addr.address);
      },vote,accounts[i]));
    }

    for(i=4;i<=6;i++){
      txs.push(ptool.generateTx(function([visitCounter,from]){
        return visitCounter.connect(from).visit();
      },visitCounter,accounts[i]));
    }
    for(i=7;i<=10;i++){
      txs.push(ptool.generateTx(function([coin,addr]){
        return coin.mint(addr.address,10);
      },coin,accounts[i]));
    }
    await ptool.waitingTxs(txs);

    console.log('===========second batch=====================')
    var txs=new Array();
    for(i=4;i<=6;i++){
      txs.push(ptool.generateTx(function([contract,addr]){
        return contract.giveRightToVote(addr.address);
      },vote,accounts[i]));
    }

    for(i=7;i<=10;i++){
      txs.push(ptool.generateTx(function([visitCounter,from]){
        return visitCounter.connect(from).visit();
      },visitCounter,accounts[i]));
    }
    for(i=1;i<=3;i++){
      txs.push(ptool.generateTx(function([coin,addr]){
        return coin.mint(addr.address,10);
      },coin,accounts[i]));
    }
    await ptool.waitingTxs(txs);

  }

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });