async function generateTx(fn,...args){
  
    const tx = await fn(args);
    let receipt; //=await tx.wait();

    await tx.wait()
    .then((rect) => {
        // console.log("the transaction was successful")
        receipt=rect;
    })
    .catch((error) => {
        receipt = error.receipt
        console.log(error)
    })

    return new Promise((resolve, reject) => {  
      resolve(receipt)
    })
  }
  async function waitingTxs(txs){
    await Promise.all(txs).then((values) => {
      values.forEach((item,idx) => {
        showResult(parseReceipt(item))
      })
    }).catch((error)=>{
      console.log(error)
    })
  }

  function parseReceipt(receipt){
    if(receipt.hasOwnProperty("status")){
        return {status:receipt.status,height:receipt.blockNumber}
    }
    return {status:"",height:""}
  }
  function showResult(result){
    console.log(`Tx Status:${result.status} Height:${result.height}`)
  }
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

  async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

module.exports = {
    generateTx,
    waitingTxs,
    parseReceipt,
    parseEvent,
    showResult,
    sleep
}