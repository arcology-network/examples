// require("@nomiclabs/hardhat-web3");
const hre = require("hardhat");
var cliUtil = require('@arcologynetwork/cli-util/utils/util')


async function main() { 
    const {rpcUrl,pks}=cliUtil.parseNetworkV2(hre)
    accounts = await ethers.getSigners(); 

    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const nonceManage=await cliUtil.InitNonces(pks,provider)
    
    console.log('======start deploying contract======')
    var proposals= new Array();
    proposals.push(hre.ethers.utils.formatBytes32String("Alice"));
    proposals.push(hre.ethers.utils.formatBytes32String("Bob"));

    const Vote_factory = await ethers.getContractFactory("Ballot");
    const vote = await Vote_factory.deploy(proposals);
    await vote.deployed();
    cliUtil.getNonce(nonceManage,accounts[0].address)
    console.log(`Deployed vote at ${vote.address}`)

    let nonce
    console.log('======start executing TXs calling giveRightToVote======')
    var txs=new Array();    
    for(i=1;i<=10;i++){
      nonce=cliUtil.getNonce(nonceManage,accounts[0].address)
      txs.push(cliUtil.generateTx(function([contract,addr,nextnonce]){
        return contract.giveRightToVote(addr.address,{nonce:nextnonce});
      },vote,accounts[i],nonce));
    }
    await cliUtil.waitingTxs(txs);
    
    console.log('======start executing TXs calling delegate======')
    txs=new Array();
    for(i=1;i<=5;i++){
      nonce=cliUtil.getNonce(nonceManage,accounts[i].address)
      txs.push(cliUtil.generateTx(function([vote,from,to,nonce]){
        return vote.connect(from).delegate(to.address,{nonce:nonce});
      },vote,accounts[i],accounts[i+5],nonce));
    }
    await cliUtil.waitingTxs(txs);

    console.log('======start executing TXs calling vote======')
    var txs=new Array();
    for(i=6;i<=10;i++){
      nonce=cliUtil.getNonce(nonceManage,accounts[i].address)
      voteidx=(i+5)%2
      txs.push(cliUtil.generateTx(function([vote,from,voteidx,nonce]){
        return vote.connect(from).vote(voteidx,{nonce:nonce});
      },vote,accounts[i],voteidx,nonce));
    }
    await cliUtil.waitingTxs(txs);

    console.log('======start executing TXs calling winningProposal======')
    nonce=cliUtil.getNonce(nonceManage,accounts[0].address)
    const tx = await vote.winningProposal({nonce:nonce});
    const receipt = await tx.wait();
    cliUtil.showResult(cliUtil.parseReceipt(receipt));
    console.log(`Winner Data: ${cliUtil.parseEvent(receipt,vote,"Winner")}`);
    
  }

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });