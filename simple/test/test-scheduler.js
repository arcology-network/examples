const hre = require("hardhat");
var frontendUtil = require('@arcologynetwork/frontend-util/utils/util') 

async function main() {
    accounts = await ethers.getSigners(); 

    console.log('======start deploying contract======')
    const bt_factory = await ethers.getContractFactory("ArrayClear");
    const bt = await bt_factory.deploy();
    await bt.deployed();
    console.log(`Deployed ArrayClear Test at ${bt.address}`)

    let tx,receipt;
    console.log('======first bat,Failed one ,two generations ======')
    //g1:6 g2:2
    var txs=new Array();
    for(i=1;i<=4;i++){
      txs.push(frontendUtil.generateTx(function([bt,from,val]){
        const params = {
          seed: val,                
          sd: 1                 
        };
        return bt.connect(from).pvisit(params);
      },bt,accounts[i],1));

      txs.push(frontendUtil.generateTx(function([bt,from,val]){
        return bt.connect(from).add(val);
      },bt,accounts[i],1));
    }
    await frontendUtil.waitingTxs(txs);

    console.log('======start executing TXs calling getCounter======')
    tx = await bt.getCounter();
    receipt=await tx.wait();
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
    console.log(frontendUtil.parseEvent(receipt,"CounterQuery"))
    if(frontendUtil.parseEvent(receipt,"CounterQuery")==="0x0000000000000000000000000000000000000000000000000000000000000004"){
      console.log('Test Successful');
    }else{
      console.log('Test Failed');
    } 

    console.log('====== second bat,four generations ======')
    //g1:3 g2:1 g3:3 g4:1
    txs=new Array();
    for(i=5;i<=8;i++){
      txs.push(frontendUtil.generateTx(function([bt,from,val]){
        const params = {
          seed: val,                
          sd: 1                 
        };
        return bt.connect(from).pvisit(params);
      },bt,accounts[i],1));

      txs.push(frontendUtil.generateTx(function([bt,from,val]){
        return bt.connect(from).add(val);
      },bt,accounts[i],1));
    }
    await frontendUtil.waitingTxs(txs);

    console.log('======start executing TXs calling getCounter======')
    tx = await bt.getCounter();
    receipt=await tx.wait();
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
    console.log(frontendUtil.parseEvent(receipt,"CounterQuery"))
    if(frontendUtil.parseEvent(receipt,"CounterQuery")==="0x000000000000000000000000000000000000000000000000000000000000000c"){
      console.log('Test Successful');
    }else{
      console.log('Test Failed');
    } 

    console.log('====== third bat,four generations ======')
    //g1:1 g2:1 g3:1 g4:1
    txs=new Array();
    for(i=9;i<=10;i++){
      txs.push(frontendUtil.generateTx(function([bt,from,val]){
        const params = {
          seed: val,                
          sd: 1                 
        };
        return bt.connect(from).pvisit(params);
      },bt,accounts[i],1));

      txs.push(frontendUtil.generateTx(function([bt,from,val]){
        return bt.connect(from).add(val);
      },bt,accounts[i],1));
    }
    await frontendUtil.waitingTxs(txs);
    
    console.log('======start executing TXs calling getCounter======')
    tx = await bt.getCounter();
    receipt=await tx.wait();
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
    console.log(frontendUtil.parseEvent(receipt,"CounterQuery"))
    if(frontendUtil.parseEvent(receipt,"CounterQuery")==="0x0000000000000000000000000000000000000000000000000000000000000010"){
      console.log('Test Successful');
    }else{
      console.log('Test Failed');
    } 
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