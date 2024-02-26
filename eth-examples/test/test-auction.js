const hre = require("hardhat");
var ptool = require('@arcologynetwork/benchmarktools/tools') 

async function main() {

    accounts = await ethers.getSigners(); 

    const Auction_factory = await ethers.getContractFactory("SimpleAuction");
    const auction = await Auction_factory.deploy(50,accounts[0].address);
    await auction.deployed();
    console.log(`Deployed SimpleAuction at ${auction.address}`)

    

    console.log('===========bid=====================')

    // var txs=new Array();
    // for(i=1;i<=10;i++){
    //   txs.push(ptool.generateTx(function([auction,from,bidval]){
    //     return auction.connect(from).bid({value:bidval});
    //   },auction,accounts[i],100+i));
    // }
    // await ptool.waitingTxs(txs);
    
    console.log('===========auctionEnd=====================')
    // let receipt ;
    while(true){
      // await ptool.sleep(10000);

      tx = await auction.auctionEnd();
      let receipt
      await tx.wait()
      .then((rect) => {
          console.log("the transaction was successful")
          receipt=rect;
      })
      .catch((error) => {
          receipt = error.receipt
      })
      console.log(receipt)
      ptool.showResult(ptool.parseReceipt(receipt));
      if(ptool.parseEvent(receipt,"AuctionEndCompleted")==="0x0000000000000000000000000000000000000000000000000000000000000001"){
        break;
      }
      
    }
    console.log('===========withdraw=====================')
    var txs=new Array();
    for(i=1;i<=10;i++){
      txs.push(ptool.generateTx(function([auction,from]){
        return auction.connect(from).withdraw();
      },auction,accounts[i]));
    }
    await ptool.waitingTxs(txs);
  }

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });