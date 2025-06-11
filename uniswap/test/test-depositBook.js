const hre = require("hardhat");
var frontendUtil = require('@arcologynetwork/frontend-util/utils/util')
const nets = require('../network.json');

async function main() {
    accounts = await ethers.getSigners(); 
    const provider = new ethers.providers.JsonRpcProvider(nets[hre.network.name].url);
    const pkCreator=nets[hre.network.name].accounts[0]
    const signerCreator = new ethers.Wallet(pkCreator, provider);
    frontendUtil.ensurePath('data');

    const bt_factory = await ethers.getContractFactory("DepositBook");
    const bt = await bt_factory.deploy();
    await bt.deployed();
    console.log(`Deployed DepositBook Test at ${bt.address}`)

    let tx,receipt,i;

    console.log('===========getBalance=====================')
    for(i=1;i<=4;i++){
      tx = await bt.getBalance(accounts[i].address);
      receipt=await tx.wait();
      frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
      console.log(`Balance of adrress ${accounts[i].address} ${BigInt(frontendUtil.parseEvent(receipt,"PrintBalance"))}`)
    }
    
    console.log('===========add first bat=====================')
    var txs=new Array();
    for(i=1;i<=4;i++){
      txs.push(frontendUtil.generateTx(function([bt,from,val]){
        return bt.connect(from).add(val, {
          value: 25500000+val,
        });
      },bt,accounts[i],i));
    }
    await frontendUtil.waitingTxs(txs);

    console.log('===========getBalance=====================')
    for(i=1;i<=4;i++){
      tx = await bt.getBalance(accounts[i].address);
      receipt=await tx.wait();
      frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
      console.log(`Balance of adrress ${accounts[i].address} ${BigInt(frontendUtil.parseEvent(receipt,"PrintBalance"))}`)
    }

    // console.log('===========get totals=====================')
    // tx = await bt.getTotal();
    // const receipt=await tx.wait();
    // frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
    // console.log(frontendUtil.parseEvent(receipt,"CounterQuery"))
    // if(frontendUtil.parseEvent(receipt,"CounterQuery")==="0x000000000000000000000000000000000000000000000000000000000000000f"){
    //   console.log('Test Successful');
    // }else{
    //   console.log('Test Failed');
    // } 
  }


async function writePreSignedTxFile(txfile,signer,tx){
  const fulltx=await signer.populateTransaction(tx)
  const rawtx=await signer.signTransaction(fulltx)
  frontendUtil.appendTo(txfile,rawtx+',\n')
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