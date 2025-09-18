const hre = require("hardhat");
var frontendUtil = require('@arcologynetwork/frontend-util/utils/util')

async function main() {
    accounts = await ethers.getSigners(); 

    console.log('======start deploying contract======')
    const vending_factory = await ethers.getContractFactory("VendingMachine");
    const vendingMachine = await vending_factory.deploy();
    await vendingMachine.deployed();
    console.log(`Deployed vendingMachine at ${vendingMachine.address}`)

    let receipt,i,txs;
    console.log('======start executing TXs calling refill======')
    tx = await vendingMachine.refill(100);
    receipt=await tx.wait();
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
       
    console.log('======start executing TXs calling getCupcakeStock======')
    tx = await vendingMachine.getCupcakeStock();
    receipt=await tx.wait();
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
    console.log(`vendingMachine balance Data ${frontendUtil.parseEvent(receipt,"BalanceQuery")}`);
    if(frontendUtil.parseEvent(receipt,"BalanceQuery")==="0x0000000000000000000000000000000000000000000000000000000000000064"){
      console.log('Test Successful');
    }else{
      console.log('Test Failed');
    } 

    console.log('======start executing TXs calling purchase======')
    txs=new Array();
    for(i=1;i<=10;i++){
      txs.push(frontendUtil.generateTx(function([vendingMachine,from]){
        return vendingMachine.connect(from).purchase(i,{value: ethers.utils.parseEther("10.0")});
      },vendingMachine,accounts[i]));
    }
    await frontendUtil.waitingTxs(txs);

    console.log('======start executing TXs calling getCupcakeStock======')
    tx = await vendingMachine.getCupcakeStock();
    receipt=await tx.wait();
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
    console.log(`vendingMachine balance Data ${frontendUtil.parseEvent(receipt,"BalanceQuery")}`);
    if(frontendUtil.parseEvent(receipt,"BalanceQuery")==="0x000000000000000000000000000000000000000000000000000000000000002d"){
      console.log('Test Successful');
    }else{
      console.log('Test Failed');
    } 

    console.log('======start executing TXs calling getCupcakeBalances======')
    for(i=1;i<=10;i++){
      tx = await vendingMachine.getCupcakeBalances(accounts[i].address);
      receipt=await tx.wait();
      console.log(frontendUtil.parseEvent(receipt,"BalanceQuery"));
      frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
      console.log(`vendingMachine balance Data ${frontendUtil.parseEvent(receipt,"BalanceQuery")}`);
    }
  }

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });