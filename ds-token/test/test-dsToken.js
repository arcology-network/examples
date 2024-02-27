const hre = require("hardhat");
var frontendUtil = require('@arcologynetwork/frontend-util/utils/util') 

async function main() {

    accounts = await ethers.getSigners(); 

    const token_factory = await ethers.getContractFactory("DSToken");
    const dstoken = await token_factory.deploy('ACL');
    await dstoken.deployed();
    console.log(`Deployed DsToken at ${dstoken.address}`)


    let receipt;

    console.log('===========mint=====================')
    var txs=new Array();
    for(i=1;i<=10;i++){
      txs.push(frontendUtil.generateTx(function([dstoken,from,val]){
        return dstoken.mint(from.address,val);
      },dstoken,accounts[i],100+i));
    }
    await frontendUtil.waitingTxs(txs);
    
    console.log('===========balance=====================')
    tx = await dstoken.balance(accounts[1].address);
    receipt=await tx.wait();
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
    console.log(frontendUtil.parseEvent(receipt,"Balance"))

    
    console.log('===========transfer=====================')
    var txs=new Array();
    for(i=1;i<=5;i++){
      txs.push(frontendUtil.generateTx(function([dstoken,from,to,val]){
        return dstoken.connect(from).transfer(to.address,val);
      },dstoken,accounts[i],accounts[i+5],100+i));
    }
    await frontendUtil.waitingTxs(txs);

    console.log('===========balance=====================')
    tx = await dstoken.balance(accounts[1].address);
    receipt=await tx.wait();
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
    console.log(frontendUtil.parseEvent(receipt,"Balance"))

    console.log('===========approve=====================')

    var txs=new Array();
    for(i=1;i<=5;i++){
      txs.push(frontendUtil.generateTx(function([dstoken,from,owner]){
        return dstoken.connect(from).approves(owner.address);
      },dstoken,accounts[i+5],accounts[0]));
    }
    await frontendUtil.waitingTxs(txs);

    console.log('===========burn=====================')
    var txs=new Array();
    for(i=1;i<=5;i++){
      txs.push(frontendUtil.generateTx(function([dstoken,from,val]){
        return dstoken.burn(from.address,val);
      },dstoken,accounts[i+5],100+i));
    }
    await frontendUtil.waitingTxs(txs);

    //transfer from one to five accounts
    console.log('===========mint=====================')

    var txs=new Array();
    for(i=1;i<=1;i++){
      txs.push(frontendUtil.generateTx(function([dstoken,from,val]){
        return dstoken.mint(from.address,val);
      },dstoken,accounts[i],80));
    }
    await frontendUtil.waitingTxs(txs);

    console.log('===========transfer=====================')
    var txs=new Array();
    for(i=1;i<=5;i++){
      txs.push(frontendUtil.generateTx(function([dstoken,from,to,val]){
        return dstoken.connect(from).transfer(to.address,val);
      },dstoken,accounts[1],accounts[i+5],20));
    }
    await frontendUtil.waitingTxs(txs);
    
  }

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });