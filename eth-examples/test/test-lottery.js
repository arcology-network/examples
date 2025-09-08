// require("@nomiclabs/hardhat-web3");
const hre = require("hardhat");
var frontendUtil = require('@arcologynetwork/frontend-util/utils/util')


async function main() { 
    accounts = await ethers.getSigners(); 

    const Lottery_factory = await ethers.getContractFactory("EduLottery");
    const lottery = await Lottery_factory.deploy();
    await lottery.deployed();
    console.log(`Deployed lottery at ${lottery.address}`)


    console.log('===========join=====================')
    let payVal=ethers.utils.parseUnits("0.005", 18);
    var txs=new Array();
    for(i=1;i<=9;i++){
      txs.push(frontendUtil.generateTx(function([lottery,from]){
        return lottery.connect(from).join({value:payVal});
      },lottery,accounts[i]));
    }
    for(i=10;i<=10;i++){
      txs.push(frontendUtil.generateTx(function([lottery,from]){
        return lottery.connect(from).join({value:100});
      },lottery,accounts[i]));
    }

    await frontendUtil.waitingTxs(txs);

    console.log('===========who Win=====================')
    const tx = await lottery.whoWin();
    const receipt=await tx.wait();
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
    const hexStr=frontendUtil.parseEvent(receipt,"PrizeQuery");
    console.log(`${frontendUtil.parseEvent(receipt,"PrizeAddressQiery")} finally won the prize ${hexStr}`)
    if(hexStr==="0x000000000000000000000000000000000000000000000000009fdf42f6e48000"){
      console.log('Test Successful');
    }else{
      console.log('Test Failed');
    }
  }

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });