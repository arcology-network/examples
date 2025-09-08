const hre = require("hardhat");
var frontendUtil = require('@arcologynetwork/frontend-util/utils/util')
const nets = require('../network.json');

async function main() {
  
  accounts = await ethers.getSigners(); 
 
  
  let i,tx,receipt;

  console.log('===========start create TempContract=====================')
  const tmpFactory = await ethers.getContractFactory("TempContract");  
  const tmp = await tmpFactory.deploy();
  await tmp.deployed();
  console.log(`Deployed TempContract at ${tmp.address}`);
  


  console.log('===========add=====================')
  var txs=new Array();
  for(i=1;i<=5;i++){
    txs.push(frontendUtil.generateTx(function([tmp,from,val]){
      return tmp.connect(from).add(val);
    },tmp,accounts[i],i));
  }
  await frontendUtil.waitingTxs(txs);
  // console.log(`Balance of account ${accounts[i].address}: ${BalanceOf(receipt)} token`);
  
  
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
