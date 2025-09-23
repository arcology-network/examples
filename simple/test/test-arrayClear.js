const hre = require("hardhat");
var frontendUtil = require('@arcologynetwork/frontend-util/utils/util') 

async function main() {
    accounts = await ethers.getSigners(); 

    console.log('======start deploying contract======')
    const bt_factory = await ethers.getContractFactory("DuoDeferred");
    const bt = await bt_factory.deploy();
    await bt.deployed();
    console.log(`Deployed DuoDeferred Test at ${bt.address}`)

    console.log('======start executing TXs calling pvisit first bat======')
    var txs=new Array();
    for(i=1;i<=3;i++){
      txs.push(frontendUtil.generateTx(function([bt,from,val]){
        const params = {
          seed: val,                
          sd: 1                 
        };
        return bt.connect(from).pvisit(params);
      },bt,accounts[i],i));
    }
    await frontendUtil.waitingTxs(txs);

    console.log('======start executing TXs calling query counter======')
    tx = await bt.getCounter();
    receipt=await tx.wait();
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
    console.log(frontendUtil.parseEvent(receipt,"CounterQuery"))
    if(frontendUtil.parseEvent(receipt,"CounterQuery")==="0x0000000000000000000000000000000000000000000000000000000000000003"){
      console.log('Test Successful');
    }else{
      console.log('Test Failed');
    } 

    console.log('======start executing TXs calling pvisit second bat======')
    txs=new Array();
    for(i=4;i<=6;i++){
      txs.push(frontendUtil.generateTx(function([bt,from,val]){
        const params = {
          seed: val,                
          sd: 1                 
        };
        return bt.connect(from).pvisit(params);
      },bt,accounts[i],i));
    }
    await frontendUtil.waitingTxs(txs);
    
    console.log('======start executing TXs calling query counter======')
    tx = await bt.getCounter();
    receipt=await tx.wait();
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
    console.log(frontendUtil.parseEvent(receipt,"CounterQuery"))
    if(frontendUtil.parseEvent(receipt,"CounterQuery")==="0x0000000000000000000000000000000000000000000000000000000000000006"){
      console.log('Test Successful');
    }else{
      console.log('Test Failed');
    } 

    console.log('======start executing TXs calling pvisit third bat======')
    txs=new Array();
    for(i=7;i<=9;i++){
      txs.push(frontendUtil.generateTx(function([bt,from,val]){
        const params = {
          seed: val,                
          sd: 1                 
        };
        return bt.connect(from).pvisit(params);
      },bt,accounts[i],i));
    }
    for(i=10;i<=10;i++){
      txs.push(frontendUtil.generateTx(function([bt,from,val]){
        const params = {
          seed: val,                
          sd: 0                 
        };
        return bt.connect(from).pvisit(params);
      },bt,accounts[i],i));
    }

    await frontendUtil.waitingTxs(txs);
    
    console.log('======start executing TXs calling query counter======')
    tx = await bt.getCounter();
    receipt=await tx.wait();
    // console.log(receipt);
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
    let result=frontendUtil.parseEvent(receipt,"CounterQuery");
    console.log(result)
    if(result==="0x000000000000000000000000000000000000000000000000000000000000000d" 
      || result==='0x0000000000000000000000000000000000000000000000000000000000000006'
      || result==='0x0000000000000000000000000000000000000000000000000000000000000009'){
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