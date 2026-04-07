const hre = require("hardhat");
var cliUtil = require('@arcologynetwork/cli-util/utils/util')
const { expect } = require("chai");


async function main() {
  
  accounts = await ethers.getSigners(); 
 
  const {rpcUrl,pks}=cliUtil.parseNetworkV2(hre)
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const nonceManage=await cliUtil.InitNonces(pks,provider)
  
  let i,tx,receipt;
  let tokenCount = 3 ;

  console.log('===========start create Token=====================')
  let nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
  const tokenFactory = await ethers.getContractFactory("Token");  
  const tokenIns = await tokenFactory.deploy("token", "TKN",{nonce:nextnonce});
  await tokenIns.deployed();
  console.log(`Deployed token at ${tokenIns.address}`);
  
  var txs=new Array();
  console.log('===========start mint token=====================')
  for (i=1;i<=tokenCount;i++) {
    nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
    txs.push(cliUtil.generateTx(function([token,receipt,amount,nextnonce]){
      return token.mint(receipt,amount,{nonce:nextnonce});
    },tokenIns,accounts[i].address,100,nextnonce));
  }
  await cliUtil.waitingTxs(txs);

  let bals=[0,100,100,100];
  for(i=0;i<=tokenCount;i++){
    nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
    tx = await tokenIns.balanceOf(accounts[i].address,{nonce:nextnonce});
    receipt=await tx.wait();
    expect(BalanceOf(tokenIns,receipt)).to.equal(bals[i]);
  }

  console.log('===========start approve token=====================')
  txs=new Array();
  for (i=1;i<=tokenCount;i++) {
    nextnonce=cliUtil.getNonce(nonceManage,accounts[i].address)
    txs.push(cliUtil.generateTx(function([token,from,receiverAdr,amount,nextnonce]){
      return token.connect(from).approve(receiverAdr,amount,{nonce:nextnonce});
    },tokenIns,accounts[i],accounts[0].address,100,nextnonce));
  }
  await cliUtil.waitingTxs(txs);

  console.log('===========start transfer token=====================')
  txs=new Array();
  for (i=1;i<=tokenCount;i++) {
    nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
    txs.push(cliUtil.generateTx(function([token,from,receiver,amount,nextnonce]){
      return token.transferFrom(from.address,receiver.address,amount,{nonce:nextnonce});
    },tokenIns,accounts[i],accounts[0],100,nextnonce));
  }
  await cliUtil.waitingTxs(txs);

  bals=[300,0,0,0];
  for(i=0;i<=tokenCount;i++){
    nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
    tx = await tokenIns.balanceOf(accounts[i].address,{nonce:nextnonce});
    receipt=await tx.wait();
    expect(BalanceOf(tokenIns,receipt)).to.equal(bals[i]);
  }
  
}

function BalanceOf(contract,receipt){
  return cliUtil.parseEvent(receipt,contract,"BalanceQuery")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
