const hre = require("hardhat");
var frontendUtil = require('@arcologynetwork/frontend-util/utils/util')
const nets = require('../network.json');

async function main() {
  
  accounts = await ethers.getSigners(); 
 
  
  let i,tx;
  let tokenCount = 3 ;

  console.log('===========start create Token=====================')
  const tokenFactory = await ethers.getContractFactory("Token");  
  const tokenIns = await tokenFactory.deploy("token", "TKN");
  await tokenIns.deployed();
  console.log(`Deployed token${i} at ${tokenIns.address}`);
  
  var txs=new Array();
  console.log('===========start mint token=====================')
  for (i=1;i<=tokenCount;i++) {
    txs.push(frontendUtil.generateTx(function([token,receipt,amount]){
      return token.mint(receipt,amount);
    },tokenIns,accounts[i].address,100));
  }
  await frontendUtil.waitingTxs(txs);

  console.log('===========query balance=====================')
  for(i=0;i<=tokenCount;i++){
    balance = await tokenIns.balanceOf(accounts[i].address);
    console.log(`Balance of account ${accounts[i].address}: ${balance} token`);
  }

  console.log('===========start approve token=====================')
  txs=new Array();
  for (i=1;i<=tokenCount;i++) {
    txs.push(frontendUtil.generateTx(function([token,from,receiverAdr,amount]){
      return token.connect(from).approve(receiverAdr,amount);
    },tokenIns,accounts[i],accounts[0].address,100));
  }
  await frontendUtil.waitingTxs(txs);

  console.log('===========start transfer token=====================')
  txs=new Array();
  for (i=1;i<=tokenCount;i++) {
    txs.push(frontendUtil.generateTx(function([token,from,receiver,amount]){
      return token.transferFrom(from.address,receiver.address,amount);
    },tokenIns,accounts[i],accounts[0],100));
  }
  await frontendUtil.waitingTxs(txs);

  console.log('===========query balance=====================')
  for(i=0;i<=tokenCount;i++){
    balance = await tokenIns.balanceOf(accounts[i].address);
    console.log(`Balance of account ${accounts[i].address}: ${balance} token`);
  }
  
}



main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
