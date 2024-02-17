const hre = require("hardhat");
var ptool = require('./tools') 

async function main() {

    accounts = await ethers.getSigners(); 

    const transfer_factory = await ethers.getContractFactory("transferTest");
    const transferTest = await transfer_factory.deploy();
    await transferTest.deployed();
    console.log(`Deployed transferTest at ${transferTest.address}`)

    

    console.log('===========getBalance=====================')

    let tx = await transferTest.getBalance();
    let receipt=await tx.wait();
    ptool.showResult(ptool.parseReceipt(receipt));

    console.log(`Balance of contract ${ptool.parseEvent(receipt,"BalanceEvent")}`)
    console.log(`Balance of sneder ${ptool.parseEvent(receipt,"Balance2Event")}`)

    console.log('===========transfer=====================')
    tx = await transferTest.transderToContract({value:10});
    receipt=await tx.wait();
    ptool.showResult(ptool.parseReceipt(receipt));

    console.log(`TRnasfer to contract ${ptool.parseEvent(receipt,"TransferEvent")}`)
    
    console.log('===========getBalance=====================')

    tx = await transferTest.getBalance();
    receipt=await tx.wait();
    ptool.showResult(ptool.parseReceipt(receipt));

    console.log(`Balance of contract ${ptool.parseEvent(receipt,"BalanceEvent")}`)
    console.log(`Balance of sneder ${ptool.parseEvent(receipt,"Balance2Event")}`)

    console.log('===========transfer will failed=====================')
    
    tx = await transferTest.transderToContract({value:20});
    await tx.wait()
    .then((rect) => {
        console.log("the transaction was successful")
        receipt=rect;
    })
    .catch((error) => {
        receipt = error.receipt
    })
    // console.log(receipt)
    ptool.showResult(ptool.parseReceipt(receipt));
    
      
    
    console.log('===========getBalance=====================')

    tx = await transferTest.getBalance();
    receipt=await tx.wait();
    ptool.showResult(ptool.parseReceipt(receipt));

    console.log(`Balance of contract ${ptool.parseEvent(receipt,"BalanceEvent")}`)
    console.log(`Balance of sneder ${ptool.parseEvent(receipt,"Balance2Event")}`)
  }

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });