const hre = require("hardhat");
var ptool = require('./tools') 

async function main() {

    accounts = await ethers.getSigners(); 

    const token_factory = await ethers.getContractFactory("DSToken");
    const dstoken = await token_factory.deploy('ACL');
    await dstoken.deployed();
    console.log(`Deployed DsToken at ${dstoken.address}`)

    const bt_factory = await ethers.getContractFactory("BoolTest");
    const bt = await bt_factory.deploy();
    await bt.deployed();
    console.log(`Deployed Bool Test at ${bt.address}`)

    const Vote_factory = await ethers.getContractFactory("Ballot");
    var proposals= new Array();
    proposals.push(hre.ethers.utils.formatBytes32String("Alice"));
    proposals.push(hre.ethers.utils.formatBytes32String("Bob"));

    const vote = await Vote_factory.deploy(proposals);
    await vote.deployed();
    console.log(`Deployed vote at ${vote.address}`)




    console.log('===========first batch=====================')
    var txs=new Array();
    for(i=1;i<=3;i++){
      txs.push(ptool.generateTx(function([dstoken,from,val]){
        return dstoken.mint(from.address,val);
      },dstoken,accounts[i],100+i));
    }

    for(i=4;i<=6;i++){
      txs.push(ptool.generateTx(function([bt,from]){
        return bt.connect(from).visit();
      },bt,accounts[i]));
    }

    for(i=7;i<=10;i++){
      txs.push(ptool.generateTx(function([contract,addr]){
        return contract.giveRightToVote(addr.address);
      },vote,accounts[i]));
    }
    await ptool.waitingTxs(txs);

    console.log('===========second batch=====================')
    var txs=new Array();
    for(i=4;i<=6;i++){
      txs.push(ptool.generateTx(function([dstoken,from,val]){
        return dstoken.mint(from.address,val);
      },dstoken,accounts[i],100+i));
    }

    for(i=7;i<=10;i++){
      txs.push(ptool.generateTx(function([bt,from]){
        return bt.connect(from).visit();
      },bt,accounts[i]));
    }

    for(i=1;i<=3;i++){
      txs.push(ptool.generateTx(function([contract,addr]){
        return contract.giveRightToVote(addr.address);
      },vote,accounts[i]));
    }
    await ptool.waitingTxs(txs);

  }

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });