const hre = require("hardhat");
var frontendUtil = require('@arcologynetwork/frontend-util/utils/util')
const nets = require('../network.json');

async function main() {
  
  accounts = await ethers.getSigners(); 
 
  
  let i,tx,receipt;

  console.log('===========start create Clear=====================')
  const clearFactory = await ethers.getContractFactory("Clear");  
  const clear = await clearFactory.deploy();
  await clear.deployed();
  console.log(`Deployed Clear at ${clear.address}`);
  


  console.log('===========add=====================')
  var txs=new Array();
  for(i=1;i<=10;i++){
    txs.push(frontendUtil.generateTx(function([clear,from,val]){
      return clear.connect(from).add(1);
    },clear,accounts[i],i));
  }
  await frontendUtil.waitingTxs(txs);

  txs=new Array();
  for(i=11;i<=20;i++){
    txs.push(frontendUtil.generateTx(function([clear,from,val]){
      return clear.connect(from).add(1);
    },clear,accounts[i],i));
  }
  await frontendUtil.waitingTxs(txs);

  txs=new Array();
  for(i=21;i<=30;i++){
    txs.push(frontendUtil.generateTx(function([clear,from,val]){
      return clear.connect(from).add(1);
    },clear,accounts[i],i));
  }
  await frontendUtil.waitingTxs(txs);

  txs=new Array();
  for(i=31;i<=40;i++){
    txs.push(frontendUtil.generateTx(function([clear,from,val]){
      return clear.connect(from).add(1);
    },clear,accounts[i],i));
  }
  await frontendUtil.waitingTxs(txs);
}

function BalanceOf(receipt){
  let hexStr=frontendUtil.parseEvent(receipt,"BalanceQuery")
  // console.log(`Balance of sneder ${hexStr}`)
  return BigInt(hexStr); 
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
