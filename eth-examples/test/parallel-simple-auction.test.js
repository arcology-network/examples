const hre = require("hardhat");
var cliUtil = require('@arcologynetwork/cli-util/utils/util')


async function main() {
    accounts = await ethers.getSigners(); 

    const {rpcUrl,pks}=cliUtil.parseNetworkV2(hre)
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const nonceManage=await cliUtil.InitNonces(pks,provider)

    console.log('======start deploying contract======')
    let nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
    const Auction_factory = await ethers.getContractFactory("SimpleAuction");
    const auction = await Auction_factory.deploy(30,accounts[0].address,{nonce:nextnonce});
    await auction.deployed();
    console.log(`Deployed SimpleAuction at ${auction.address}`)

    console.log('======start executing TXs calling bid======')
    var txs=new Array();
    for(i=1;i<=10;i++){
      nextnonce=cliUtil.getNonce(nonceManage,accounts[i].address)
      txs.push(cliUtil.generateTx(function([auction,from,bidval,nextnonce]){
        return auction.connect(from).bid({value:bidval,nonce:nextnonce});
      },auction,accounts[i],100+i,nextnonce));
    }
    await cliUtil.waitingTxs(txs);
    
    console.log('======start executing TXs calling auctionEnd======')
    while(true){
      await cliUtil.sleep(35000)
      nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
      tx = await auction.auctionEnd({nonce:nextnonce});
      let receipt
      await tx.wait()
      .then((rect) => {
          console.log("✅ The transaction was successful")
          receipt=rect;
      })
      .catch((error) => {
          receipt = error.receipt
      })
      cliUtil.showResult(cliUtil.parseReceipt(receipt));
      if(Number(cliUtil.parseEvent(receipt,auction,"AuctionEndCompleted"))===1){
        break;
      }
    }

    console.log('======start executing TXs calling withdraw======')
    var txs=new Array();
    for(i=1;i<=10;i++){
      nextnonce=cliUtil.getNonce(nonceManage,accounts[i].address)
      txs.push(cliUtil.generateTx(function([auction,from,nextnonce]){
        return auction.connect(from).withdraw({nonce:nextnonce});
      },auction,accounts[i],nextnonce));
    }
    await cliUtil.waitingTxs(txs);
  }

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });