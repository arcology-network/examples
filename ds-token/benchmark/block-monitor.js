var ptool = require('@arcologynetwork/concurrentlib/js/tools') 
const hre = require("hardhat");

//nodejs block-monitor.js http://host:port
async function main() {
    var args = process.argv.splice(2);
    const provider = new hre.ethers.providers.JsonRpcProvider(args[0]);

    let startBlocknum= await provider.send("eth_blockNumber");
    let loop=true;
    let blocknum=parseInt(startBlocknum);
    while (loop)
    {
      let block;
      let uncreated=false;
      await provider.send("eth_getBlockByNumber", ['0x'+(blocknum).toString(16),false])
      .then((b) => {
          block=b;
      })
      .catch((error) => {
          uncreated=true;
      })
      
      if(uncreated){
        await ptool.sleep(1000);
        continue;
      }
      const hashes=block.transactions;
      let successful=0;
      let fail=0;
      for(i=0;i<hashes.length;i++){
        const receipt=await provider.send("eth_getTransactionReceipt", [hashes[i]]);
        if(receipt.status=='0x1'){
          successful=successful+1;
        }else{
          fail=fail+1;
        }
      }

      if(hashes.length>0){
        console.log(`height = ${parseInt(block.number)}, total = ${hashes.length}, success = ${successful}, fail = ${fail}, timestamp = ${parseInt(block.timestamp)}`)
      }else{
        console.log(`height = ${parseInt(block.number)}, empty block, timestamp = ${parseInt(block.timestamp)}`)
      }
      blocknum = blocknum + 1;
    }
  }

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });