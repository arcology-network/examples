const hre = require("hardhat");
var frontendUtil = require('@arcologynetwork/frontend-util/utils/util') 

async function main() {
    accounts = await ethers.getSigners(); 

    const ord_factory = await ethers.getContractFactory("OrderedSetEx");
    const ord = await ord_factory.deploy();
    await ord.deployed();
    console.log(`Deployed OrderedSetEx Test at ${ord.address}`)

    let receipt;

    console.log('===========set=====================')
    var txs=new Array();
    for(i=1;i<=5;i++){
      txs.push(frontendUtil.generateTx(function([ord,from,val]){
        return ord.set(accounts[i].address,val);
      },ord,accounts[i],i));
    }
    await frontendUtil.waitingTxs(txs);
    
    console.log('===========list=====================')
    tx = await ord.list();
    receipt=await tx.wait();
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
    
    console.log('===========reset=====================')
    tx = await ord.reset();
    receipt=await tx.wait();
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));


    console.log('===========set=====================')
    var txs=new Array();
    for(i=6;i<=8;i++){
      txs.push(frontendUtil.generateTx(function([ord,from,val]){
        return ord.set(accounts[i].address,val);
      },ord,accounts[i],i));
    }
    for(i=6;i<=6;i++){
      txs.push(frontendUtil.generateTx(function([ord,from,val]){
        return ord.set(accounts[i].address,val);
      },ord,accounts[i],9));
    }

    await frontendUtil.waitingTxs(txs);
    
    console.log('===========list=====================')
    tx = await ord.list();
    receipt=await tx.wait();
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
  }


/**
 * Waits for multiple transactions to complete and shows the results.
 * @param {Array<Promise>} txs - An array of transaction promises.
 */
async function waitingTxs(txs){
  await Promise.all(txs).then((values) => {
    values.forEach((item,idx) => {
      showResult(parseReceipt(item))
      console.log(item)
    })
  }).catch((error)=>{
    console.log(error)
  })
}

/**
 * Parses a transaction receipt and extracts the status and block height.
 * @param {Object} receipt - The transaction receipt object.
 * @returns {Object} - An object containing the status and height of the transaction.
 */
function parseReceipt(receipt){
  if(receipt.hasOwnProperty("status")){
      return {status:receipt.status,height:receipt.blockNumber}
  }
  return {status:"",height:""}
}

/**
 * Displays the status and height of a transaction.
 * @param {Object} result - The result object containing the status and height.
 */
function showResult(result){
  console.log(`Tx Status:${result.status} Height:${result.height}`)
}

/**
 * Parses an event from a transaction receipt.
 * @param {Object} receipt - The transaction receipt object.
 * @param {string} eventName - The name of the event to parse.
 * @returns {Object|string} - The data of the event if found, otherwise an empty string.
 */
function parseEvent(receipt,eventName){
  if(receipt.hasOwnProperty("status")&&receipt.status==1){
      for(i=0;i<receipt.events.length;i++){
          if(receipt.events[i].event===eventName){
              return receipt.events[i].data;
          } 
      }
  }
  return "";
}

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });