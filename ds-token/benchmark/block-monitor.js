var ptool = require('@arcologynetwork/benchmarktools/tools') 
const hre = require("hardhat");

/**
 * Calculates the maximum TPS (Transactions Per Second), real TPS, and blocks within one minute.
 * @param {number} maxTps - The maximum TPS value.
 * @param {Array} blocks - An array of blocks.
 * @returns {Object} - An object containing the maximum TPS, real TPS, and blocks within one minute.
 */

function calculateTps(maxTps,blocks){
  if(blocks.length>1){
    const txsNums=blocks[blocks.length-2].transactions.length;
    const lastTps=parseInt(txsNums/(blocks[blocks.length-1].timestamp-blocks[blocks.length-2].timestamp))
    maxTps=lastTps>maxTps?lastTps:maxTps;
  }

  let nblocks=new Array();
  let now=parseInt(blocks[blocks.length-1].timestamp)
  for(i=0;i<blocks.length;i++){
    if(parseInt(blocks[i].timestamp)+60<now){
      continue;
    }
    nblocks.push(blocks[i]);
  }

  let totalTxs=0;
  for(i=0;i<nblocks.length;i++){
    totalTxs=totalTxs+nblocks[i].transactions.length;
  }

  let seconds=60;
  if(nblocks.length>1){
    seconds=blocks[blocks.length-1].timestamp-blocks[0].timestamp;
  }

  const realtimeTps=parseInt(totalTxs/seconds);
  const tps=realtimeTps>maxTps?realtimeTps:maxTps;
  return {"maxTps":tps,"realtimeTps":realtimeTps,"blocksWithInOneMinute":nblocks}
}

//nodejs block-monitor.js http://host:port
async function main() {
    var args = process.argv.splice(2);
    const provider = new hre.ethers.providers.JsonRpcProvider(args[0]);

    let startBlocknum= await provider.send("eth_blockNumber");
    let loop=true;
    let blocknum=parseInt(startBlocknum);
    var blocksWithInOneMinute=new Array();
    let maxTps=0;
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
      blocksWithInOneMinute.push(block);
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
      const result=calculateTps(maxTps,blocksWithInOneMinute);
      maxTps=result.maxTps;
      blocksWithInOneMinute=result.blocksWithInOneMinute;
      
      if(hashes.length>0){
        console.log(`height = ${parseInt(block.number)}, total = ${hashes.length}, success = ${successful}, fail = ${fail}, timestamp = ${parseInt(block.timestamp)}, maxTps = ${result.maxTps}, realtimeTps(1m) = ${result.realtimeTps}`)
      }else{
        console.log(`height = ${parseInt(block.number)}, empty block, timestamp = ${parseInt(block.timestamp)}, maxTps = ${result.maxTps}, realtimeTps(1m) = ${result.realtimeTps}`)
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