const hre = require("hardhat");
var frontendUtil = require('@arcologynetwork/frontend-util/utils/util')

async function main() {
    accounts = await ethers.getSigners(); 

    const coin_factory = await ethers.getContractFactory("SubCoin");
    const coin = await coin_factory.deploy();
    await coin.deployed();
    console.log(`Deployed SubCoin at ${coin.address}`)

    let i,tx,txs,receipt
    
    console.log('===========mint=====================')
    tx = await coin.mint(accounts[1].address,10);
    receipt=await tx.wait();
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
    console.log(`Mint Data ${frontendUtil.parseEvent(receipt,"Mint")}`)

    console.log('===========getter=====================')
    tx = await coin.getter(accounts[1].address);
    receipt=await tx.wait();
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));

    if(frontendUtil.parseEvent(receipt,"GetBalance")==="0x000000000000000000000000000000000000000000000000000000000000000a"){
      console.log('Mint Successful');
    }else{
      console.log('Mint Failed');
    }

    console.log('===========send=====================')
    tx = await coin.connect(accounts[1]).send(accounts[2].address,10);
    receipt=await tx.wait();
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
    console.log(`Send to ${accounts[2].address} 10`)

    console.log('===========getter=====================')
    tx = await coin.getter(accounts[1].address);
    receipt=await tx.wait();
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
    if(frontendUtil.parseEvent(receipt,"GetBalance")==="0x0000000000000000000000000000000000000000000000000000000000000000"){
      console.log('Send Successful');
    }else{
      console.log('Send Failed');
    }

    
    
    
    console.log('===========parallel=====================')
    txs=new Array();
    for(i=3;i<=10;i++){
      txs.push(frontendUtil.generateTx(function([coin,addr]){
        return coin.mint(addr.address,10);
      },coin,accounts[i]));
    }
    await frontendUtil.waitingTxs(txs);

    console.log('===========balance=====================')
    for(i=3;i<=10;i++){
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