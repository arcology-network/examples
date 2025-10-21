const hre = require("hardhat");
var frontendUtil = require('@arcologynetwork/frontend-util/utils/util')

async function main() {
    accounts = await ethers.getSigners(); 

    console.log('======start deploying contract======')
    const Auction_factory = await ethers.getContractFactory("SimpleAuction");
    const auction = await Auction_factory.deploy(30,accounts[0].address);
    await auction.deployed();
    console.log(`Deployed SimpleAuction at ${auction.address}`)

    console.log('======start executing TXs calling bid======')
    var txs=new Array();
    for(i=1;i<=10;i++){
      txs.push(frontendUtil.generateTx(function([auction,from,bidval]){
        return auction.connect(from).bid({value:bidval});
      },auction,accounts[i],100+i));
    }
    await frontendUtil.waitingTxs(txs);
    
    console.log('======start executing TXs calling auctionEnd======')
    while(true){
      await frontendUtil.sleep(35000)
      tx = await auction.auctionEnd();
      let receipt
      await tx.wait()
      .then((rect) => {
          console.log("✅ The transaction was successful")
          receipt=rect;
      })
      .catch((error) => {
          receipt = error.receipt
      })
      frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
      if(Number(frontendUtil.parseEvent(receipt,auction,"AuctionEndCompleted"))===1){
        break;
      }
    }

    console.log('======start executing TXs calling withdraw======')
    var txs=new Array();
    for(i=1;i<=10;i++){
      txs.push(frontendUtil.generateTx(function([auction,from]){
        return auction.connect(from).withdraw();
      },auction,accounts[i]));
    }
    await frontendUtil.waitingTxs(txs);
  }

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });