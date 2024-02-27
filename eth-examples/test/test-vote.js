// require("@nomiclabs/hardhat-web3");
const hre = require("hardhat");
var frontendUtil = require('@arcologynetwork/frontend-util/utils/util')


async function main() {

    const Vote_factory = await ethers.getContractFactory("Ballot");

    var proposals= new Array();
    proposals.push(hre.ethers.utils.formatBytes32String("Alice"));
    proposals.push(hre.ethers.utils.formatBytes32String("Bob"));

    const vote = await Vote_factory.deploy(proposals);
    await vote.deployed();
    console.log(`Deployed vote at ${vote.address}`)

    accounts = await ethers.getSigners(); 

    console.log('===========giveRightToVote=====================')

    var txs=new Array();
    for(i=1;i<=10;i++){
      txs.push(frontendUtil.generateTx(function([contract,addr]){
        return contract.giveRightToVote(addr.address);
      },vote,accounts[i]));
    }
    await frontendUtil.waitingTxs(txs);
    
    console.log('===========delegate=====================')
    txs=new Array();
    for(i=1;i<=5;i++){
      txs.push(frontendUtil.generateTx(function([vote,from,to]){
        return vote.connect(from).delegate(to.address);
      },vote,accounts[i],accounts[i+5]));
    }
    await frontendUtil.waitingTxs(txs);

    console.log('===========vote=====================')
    var txs=new Array();
    for(i=6;i<=10;i++){
      voteidx=(i+5)%2
      txs.push(frontendUtil.generateTx(function([vote,from,voteidx]){
        return vote.connect(from).vote(voteidx);
      },vote,accounts[i],voteidx));
    }
    await frontendUtil.waitingTxs(txs);


    console.log('===========winningProposal=====================')
    const tx = await vote.winningProposal();
    const receipt = await tx.wait();
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
    console.log("Winner Data:"+frontendUtil.parseEvent(receipt,"Winner"));
  }

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });