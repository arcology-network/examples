const hre = require("hardhat");
var frontendUtil = require('@arcologynetwork/frontend-util/utils/util')

async function main() {
    accounts = await ethers.getSigners(); 

    const coin_factory = await ethers.getContractFactory("Coin");
    const coin = await coin_factory.deploy();
    await coin.deployed();
    console.log(`Deployed SubCurrency at ${coin.address}`)

    let receipt,i,txs; 

    console.log('===========mint=====================')
    txs=new Array();
    for(i=1;i<=5;i++){
      txs.push(frontendUtil.generateTx(function([coin,to,val]){
        return coin.mint(to.address,val);
      },coin,accounts[i],100+i));
    }
    await frontendUtil.waitingTxs(txs);

    console.log('===========balance=====================')
    for(i=1;i<=10;i++){
      tx = await coin.getter(accounts[i].address);
      receipt=await tx.wait();
      console.log(frontendUtil.parseEvent(receipt,"Balance"));
      frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
    }
    
    console.log('===========send=====================')
    txs=new Array();
    for(i=1;i<=5;i++){
      txs.push(frontendUtil.generateTx(function([coin,from,to,val]){
        return coin.connect(from).send(to.address,val);
      },coin,accounts[i],accounts[i+5],100+i));
    }
    await frontendUtil.waitingTxs(txs);

    console.log('===========balance=====================')
    for(i=1;i<=10;i++){
      tx = await coin.getter(accounts[i].address);
      receipt=await tx.wait();
      console.log(frontendUtil.parseEvent(receipt,"Balance"));
      frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
    }
  }

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });