const hre = require("hardhat");
var frontendUtil = require('@arcologynetwork/frontend-util/utils/util')
const nets = require('../network.json');

async function main() {
    accounts = await ethers.getSigners(); 

    const cum_factory = await ethers.getContractFactory("CumMap");
    const cum = await cum_factory.deploy();
    await cum.deployed();
    console.log(`Deployed Cum Test at ${cum.address}`)

    
    var txs=new Array();
    let i,tx,receipt;

    

    console.log('===========insert bat=====================')
    for(i=1;i<=3;i++){
      txs.push(frontendUtil.generateTx(function([cum,from,val]){
        return cum.insert(from.address,val, {
          gasLimit: 500000000,
        });
      },cum,accounts[i],i));
    }
    await frontendUtil.waitingTxs(txs);

    

    
    console.log('===========query bat=====================')
    for(i=1;i<=3;i++){
      tx = await cum.QueryVal(accounts[i].address);
      receipt=await tx.wait();
      frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
      console.log(frontendUtil.parseEvent(receipt,"QueryBalance"))
    }
    
    console.log('===========set bat=====================')
    txs=new Array();
    for(i=1;i<=3;i++){
      txs.push(frontendUtil.generateTx(function([cum,from,val]){
        return cum.set(from.address,val, {
          gasLimit: 500000000,
        });
      },cum,accounts[i],i));
    }
    for(i=1;i<=1;i++){
      txs.push(frontendUtil.generateTx(function([cum,from,val]){
        return cum.set(from.address,val, {
          gasLimit: 500000000,
        });
      },cum,accounts[i],4));
    }
    await frontendUtil.waitingTxs(txs);

    console.log('===========query bat=====================')
    for(i=1;i<=3;i++){
      tx = await cum.QueryVal(accounts[i].address);
      receipt=await tx.wait();
      frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
      console.log(frontendUtil.parseEvent(receipt,"QueryBalance"))
    }

    console.log('===========del bat=====================')
    txs=new Array();
    for(i=1;i<=3;i++){
      txs.push(frontendUtil.generateTx(function([cum,from]){
        return cum.del(from.address, {
          gasLimit: 500000000,
        });
      },cum,accounts[i]));
    }
    for(i=1;i<=1;i++){
      txs.push(frontendUtil.generateTx(function([cum,from]){
        return cum.connect(from).del(from.address, {
          gasLimit: 500000000,
        });
      },cum,accounts[i]));
    }
    await frontendUtil.waitingTxs(txs);

    console.log('===========query bat=====================')
    for(i=1;i<=3;i++){
      tx = await cum.QueryVal(accounts[i].address);
      receipt=await tx.wait();
      frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
      console.log(frontendUtil.parseEvent(receipt,"QueryBalance"))
    }

    console.log('===========exist insert set bat=====================')
    txs=new Array();
    for(i=4;i<=5;i++){
      txs.push(frontendUtil.generateTx(function([cum,from,val]){
        return cum.exist(from.address,val, {
          gasLimit: 500000000,
        });
      },cum,accounts[i],i));
    }
    for(i=4;i<=4;i++){
      txs.push(frontendUtil.generateTx(function([cum,from,val]){
        return cum.exist(from.address,val, {
          gasLimit: 500000000,
        });
      },cum,accounts[i],6));
    }
    await frontendUtil.waitingTxs(txs);

    console.log('===========query bat=====================')
    for(i=4;i<=5;i++){
      tx = await cum.QueryVal(accounts[i].address);
      receipt=await tx.wait();
      frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
      console.log(frontendUtil.parseEvent(receipt,"QueryBalance"))
    }

    console.log('===========exist set bat=====================')
    txs=new Array();
    for(i=4;i<=5;i++){
      txs.push(frontendUtil.generateTx(function([cum,from,val]){
        return cum.existSet(from.address,val, {
          gasLimit: 500000000,
        });
      },cum,accounts[i],i));
    }
    for(i=4;i<=4;i++){
      txs.push(frontendUtil.generateTx(function([cum,from,val]){
        return cum.existSet(from.address,val, {
          gasLimit: 500000000,
        });
      },cum,accounts[i],1));
    }
    await frontendUtil.waitingTxs(txs);

    console.log('===========query bat=====================')
    for(i=4;i<=5;i++){
      tx = await cum.QueryVal(accounts[i].address);
      receipt=await tx.wait();
      frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
      console.log(frontendUtil.parseEvent(receipt,"QueryBalance"))
    }

    console.log('===========insert range test=====================')
    tx = await cum.insertRange(accounts[0].address,101);
    // receipt=await tx.wait();
    await tx.wait()
    .then((rect) => {
        console.log("the transaction was successful")
        receipt=rect;
    })
    .catch((error) => {
        receipt = error.receipt
    })

    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
    

}


  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });