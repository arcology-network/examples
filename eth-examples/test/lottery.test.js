// require("@nomiclabs/hardhat-web3");
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
    const Lottery_factory = await ethers.getContractFactory("EduLottery");
    const lottery = await Lottery_factory.deploy({nonce:nextnonce});
    await lottery.deployed();
    console.log(`Deployed lottery at ${lottery.address}`)

    console.log('======start executing TXs calling join======')
    let payVal=ethers.utils.parseUnits("0.005", 18);
    var txs=new Array();
    for(i=1;i<=9;i++){
      nextnonce=cliUtil.getNonce(nonceManage,accounts[i].address)
      txs.push(cliUtil.generateTx(function([lottery,from,nextnonce]){
        return lottery.connect(from).join({value:payVal,nonce:nextnonce});
      },lottery,accounts[i],nextnonce));
    }
    for(i=10;i<=10;i++){
      nextnonce=cliUtil.getNonce(nonceManage,accounts[i].address)
      txs.push(cliUtil.generateTx(function([lottery,from,nextnonce]){
        return lottery.connect(from).join({value:100,nonce:nextnonce});
      },lottery,accounts[i],nextnonce));
    }
    await cliUtil.waitingTxs(txs);

    console.log('======start executing TXs calling whoWin======')
    nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
    const tx = await lottery.whoWin({nonce:nextnonce});
    const receipt=await tx.wait();
    cliUtil.showResult(cliUtil.parseReceipt(receipt));
    const PrizeQuery=cliUtil.parseEvent(receipt,lottery,"PrizeQuery");
    console.log(`${cliUtil.parseEvent(receipt,lottery,"PrizeAddressQuery")} finally won the prize ${PrizeQuery}`)
    // expect(PrizeQuery+"").to.equal("45000000000000000");

    expect(PrizeQuery+""=="45000000000000000" ||  PrizeQuery+""=="0").to.be.true;
  }

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });