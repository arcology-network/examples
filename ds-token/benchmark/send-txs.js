const hre = require("hardhat");
var ptool = require('@arcologynetwork/concurrentlib/js/tools') 
const nets = require('../network.json');

//nodejs send-txs.js http://host:port filename
async function main() {
    var args = process.argv.splice(2);
    if(args.length<2){
      console.log('please input two arguments');
      return;
    }
    const provider = new hre.ethers.providers.JsonRpcProvider(args[0]);
    console.time('loading file')
    const lines=ptool.readfile(args[1])
    console.timeEnd('loading file')

    console.time('sendtime')
    const lis=lines.split('\n')

    var txs=new Array();
    for(i=0;i<lis.length;i++){
      if(lis[i].length==0){
        continue
      }
      txs.push(lis[i].split(',')[0])
      if(txs.length>=1000){
        provider.send("arcology_sendRawTransactions", [...txs]);
        txs=new Array();
      }
    }
    if(txs.length>0){
      provider.send("arcology_sendRawTransactions", [...txs]);
    }
    console.timeEnd('sendtime')

  }

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });