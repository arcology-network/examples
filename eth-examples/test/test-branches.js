const hre = require("hardhat");
var frontendUtil = require('@arcologynetwork/frontend-util/utils/util')

async function main() {
    accounts = await ethers.getSigners(); 

    const visit_factory = await ethers.getContractFactory("VisitCount");
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

    let receipt,i,txs,tx; 

    console.log('===========first batch=====================')
    txs=new Array();
    for(i=1;i<=3;i++){
      txs.push(frontendUtil.generateTx(function([contract,addr]){
        return contract.giveRightToVote(addr.address);
      },vote,accounts[i]));
    }

    for(i=4;i<=6;i++){
      txs.push(frontendUtil.generateTx(function([visitCounter,from]){
        return visitCounter.connect(from).visit(i);
      },visitCounter,accounts[i]));
    }

    for(i=7;i<=10;i++){
      txs.push(frontendUtil.generateTx(function([coin,addr]){
        return coin.mint(addr.address,10);
      },coin,accounts[i]));
    }
    
    await frontendUtil.waitingTxs(txs);

    console.log('===========balance=====================')
    tx = await vote.winningProposal();
    receipt = await tx.wait();
    console.log("Winner Data:"+frontendUtil.parseEvent(receipt,"Winner"));

    tx = await visitCounter.getCounter();
    receipt=await tx.wait();
    console.log(`Visit counter Data ${frontendUtil.parseEvent(receipt,"CounterQuery")}`);
    
    for(i=1;i<=10;i++){
      tx = await coin.getter(accounts[i].address);
      receipt=await tx.wait();
      console.log(`Mint Coin Data ${frontendUtil.parseEvent(receipt,"GetBalance")}`);
    }

    console.log('===========second batch=====================')
    txs=new Array();
    for(i=1;i<=3;i++){
      txs.push(frontendUtil.generateTx(function([coin,addr]){
        return coin.mint(addr.address,10);
      },coin,accounts[i]));
    }

    for(i=4;i<=6;i++){
      txs.push(frontendUtil.generateTx(function([contract,addr]){
        return contract.giveRightToVote(addr.address);
      },vote,accounts[i]));
    }

    for(i=7;i<=10;i++){
      txs.push(frontendUtil.generateTx(function([visitCounter,from]){
        return visitCounter.connect(from).visit(i);
      },visitCounter,accounts[i]));
    }
    await frontendUtil.waitingTxs(txs);

    console.log('===========balance=====================')
    tx = await vote.winningProposal();
    receipt = await tx.wait();
    console.log("Winner Data:"+frontendUtil.parseEvent(receipt,"Winner"));

    tx = await visitCounter.getCounter();
    receipt=await tx.wait();
    console.log(`Visit counter Data ${frontendUtil.parseEvent(receipt,"CounterQuery")}`);
    
    for(i=1;i<=10;i++){
      tx = await coin.getter(accounts[i].address);
      receipt=await tx.wait();
      console.log(`Mint Coin Data ${frontendUtil.parseEvent(receipt,"GetBalance")}`);
    }
  }

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });