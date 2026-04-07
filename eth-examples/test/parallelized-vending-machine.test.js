const hre = require("hardhat");
var cliUtil = require('@arcologynetwork/cli-util/utils/util')
const { expect } = require("chai");


async function main() {
    accounts = await ethers.getSigners(); 

    const {rpcUrl,pks}=cliUtil.parseNetworkV2(hre)
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const nonceManage=await cliUtil.InitNonces(pks,provider)

    console.log('======start deploying contract======')
    let nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
    const vending_factory = await ethers.getContractFactory("VendingMachine");
    const vendingMachine = await vending_factory.deploy({nonce:nextnonce});
    await vendingMachine.deployed();
    console.log(`Deployed vendingMachine at ${vendingMachine.address}`)

    let receipt,i,txs;
    console.log('======start executing TXs calling refill======')
    nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
    tx = await vendingMachine.refill(100,{nonce:nextnonce});
    receipt=await tx.wait();
    cliUtil.showResult(cliUtil.parseReceipt(receipt));
       
    console.log('======start executing TXs calling getCupcakeStock======')
    nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
    tx = await vendingMachine.getCupcakeStock({nonce:nextnonce});
    receipt=await tx.wait();
    cliUtil.showResult(cliUtil.parseReceipt(receipt));
    console.log(`vendingMachine balance Data ${cliUtil.parseEvent(receipt,vendingMachine,"BalanceQuery")}`);
    expect(Number(cliUtil.parseEvent(receipt,vendingMachine,"BalanceQuery"))).to.equal(100);

    console.log('======start executing TXs calling purchase======')
    txs=new Array();
    for(i=1;i<=10;i++){
      nextnonce=cliUtil.getNonce(nonceManage,accounts[i].address)
      txs.push(cliUtil.generateTx(function([vendingMachine,from,nextnonce]){
        return vendingMachine.connect(from).purchase(i,{value: ethers.utils.parseEther("10.0"),nonce:nextnonce});
      },vendingMachine,accounts[i],nextnonce));
    }
    await cliUtil.waitingTxs(txs);

    console.log('======start executing TXs calling getCupcakeStock======')
    nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
    tx = await vendingMachine.getCupcakeStock({nonce:nextnonce});
    receipt=await tx.wait();
    cliUtil.showResult(cliUtil.parseReceipt(receipt));
    console.log(`vendingMachine balance Data ${cliUtil.parseEvent(receipt,vendingMachine,"BalanceQuery")}`);
    expect(Number(cliUtil.parseEvent(receipt,vendingMachine,"BalanceQuery"))).to.equal(45);

    let expectedBalances1 = [1, 2, 3, 4, 5, 6, 7, 8,9,10];
    for (let i = 1; i <= 10; i++) {
      nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
      tx = await vendingMachine.getCupcakeBalances(accounts[i].address,{nonce:nextnonce});
      receipt=await tx.wait();
      expect(Number(cliUtil.parseEvent(receipt,vendingMachine,"BalanceQuery"))).to.equal(expectedBalances1[i - 1]);
    }

  }

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });