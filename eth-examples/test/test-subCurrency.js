const hre = require("hardhat");
var ptool = require('./tools') 

async function main() {

    accounts = await ethers.getSigners(); 

    const coin_factory = await ethers.getContractFactory("Coin");
    const coin = await coin_factory.deploy();
    await coin.deployed();
    console.log(`Deployed SubCurrency at ${coin.address}`)

    

    console.log('===========mint=====================')

    var txs=new Array();
    for(i=1;i<=5;i++){
      txs.push(ptool.generateTx(function([coin,to,val]){
        return coin.mint(to.address,val);
      },coin,accounts[i],100+i));
    }
    await ptool.waitingTxs(txs);
    
    
    console.log('===========send=====================')
    var txs=new Array();
    for(i=1;i<=5;i++){
      txs.push(ptool.generateTx(function([coin,from,to,val]){
        return coin.connect(from).send(to.address,val);
      },coin,accounts[i],accounts[i+5],100+i));
    }
    await ptool.waitingTxs(txs);
  }

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });