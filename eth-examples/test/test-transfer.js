const hre = require("hardhat");
var frontendUtil = require('@arcologynetwork/frontend-util/utils/util')

async function main() {

    accounts = await ethers.getSigners(); 

    const transfer_factory = await ethers.getContractFactory("transferTest");
    const transferTest = await transfer_factory.deploy();
    await transferTest.deployed();
    console.log(`Deployed transferTest at ${transferTest.address}`)

    

    console.log('===========getBalance=====================')

    let tx = await transferTest.getBalance();
    let receipt=await tx.wait();
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));

    console.log(`Balance of contract ${frontendUtil.parseEvent(receipt,"BalanceEvent")}`)
    console.log(`Balance of sneder ${frontendUtil.parseEvent(receipt,"Balance2Event")}`)

    console.log('===========transfer=====================')
    tx = await transferTest.transderToContract({value:10});
    receipt=await tx.wait();
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));

    console.log(`TRnasfer to contract ${frontendUtil.parseEvent(receipt,"TransferEvent")}`)
    
    console.log('===========getBalance=====================')

    tx = await transferTest.getBalance();
    receipt=await tx.wait();
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));

    console.log(`Balance of contract ${frontendUtil.parseEvent(receipt,"BalanceEvent")}`)
    console.log(`Balance of sneder ${frontendUtil.parseEvent(receipt,"Balance2Event")}`)

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
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
    
      
    
    console.log('===========getBalance=====================')

    tx = await transferTest.getBalance();
    receipt=await tx.wait();
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));

    console.log(`Balance of contract ${frontendUtil.parseEvent(receipt,"BalanceEvent")}`)
    console.log(`Balance of sneder ${frontendUtil.parseEvent(receipt,"Balance2Event")}`)
  }

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });