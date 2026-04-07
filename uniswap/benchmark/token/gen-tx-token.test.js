const hre = require("hardhat");
var cliUtil = require('@arcologynetwork/cli-util/utils/util')


async function main() {
  const {rpcUrl,pks}=cliUtil.parseNetworkV2(hre)
  accounts = await ethers.getSigners();  

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const pkCreator=pks[0]
  const signerCreator = new ethers.Wallet(pkCreator, provider);
  const txbase = 'benchmark/token/txs';
  cliUtil.ensurePath(txbase);
  
  const tokenCount=20;  //Token number
  const poolStyle=2;    //Liquidity Pool Organization
                        // 2 - (tokenA tokenB)  (tokenC tokenD)   
                        // 1 - (tokenA tokenB)  (tokenB tokenC)  (tokenC tokenD)

  
  const trnsferMode=false;

  const nonceManage=await cliUtil.InitNonces(pks,provider)
  
  let i,tx,nextnonce;

  console.log('===========start create Token=====================')
  
  const tokenFactory = await ethers.getContractFactory("Token");
  var tokenInsArray=new Array();
  for(i=0;i<tokenCount;i++){
    nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
    const tokenIns = await tokenFactory.deploy("token"+i, "TKN"+i,{nonce:nextnonce});
    await tokenIns.deployed();
    tokenInsArray.push(tokenIns);
    console.log(`Deployed token${i} at ${tokenIns.address}`);
  }
  

  let accountsLength=accounts.length
  let sendCount=100
  var txs=new Array();
  if(trnsferMode){
    console.log('===========start mint token=====================')
    let j;
    for (i=0;i<tokenCount;i++) {
      for(j=0;j+1<accountsLength;j=j+2){
        amount=ethers.utils.parseUnits("1", 18).mul(j%4+1);

        nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)

        txs=await batchSendTxs(txs,sendCount,cliUtil.generateTx(function([token,reciver,amount,nextnonce]){
          return token.mint(reciver,amount,{nonce:nextnonce});
        },tokenInsArray[i],accounts[j].address,amount,nextnonce));
      }
    }
    txs=await batchSendTxs(txs,sendCount,0);

  
    console.log('===========start transfer token=====================')
    for (i=0;i<tokenCount;i++) {
      for(j=0;j+1<accountsLength;j=j+2){
        amount=ethers.utils.parseUnits("1", 18).mul(j%4+1);

        nextnonce=cliUtil.getNonce(nonceManage,accounts[j].address)

        txs=await batchSendTxs(txs,sendCount,cliUtil.generateTx(function([token,from,to,amount,nextnonce]){
              return token.connect(from).transfer(to,amount,{nonce:nextnonce});
            },tokenInsArray[i],accounts[j],accounts[j+1].address,amount,nextnonce));

      }
    }
    txs=await batchSendTxs(txs,sendCount,0);

    console.log('===========start approve token=====================')
    for (i=0;i<tokenCount;i++) {
      for(j=0;j+1<accountsLength;j=j+2){
        amount=ethers.utils.parseUnits("1", 18).mul(j%4+1);

        nextnonce=cliUtil.getNonce(nonceManage,accounts[j+1].address)

        txs=await batchSendTxs(txs,sendCount,cliUtil.generateTx(function([token,from,routerAdr,amount,nextnonce]){
          return token.connect(from).approve(routerAdr,amount,{nonce:nextnonce});
        },tokenInsArray[i],accounts[j+1],accounts[j].address,amount,nextnonce));
      }
    }
    txs=await batchSendTxs(txs,sendCount,0);

    console.log('===========start transferFrom token=====================')
    for (i=0;i<tokenCount;i++) {
      for(j=0;j+1<accountsLength;j=j+2){
        amount=ethers.utils.parseUnits("1", 18).mul(j%4+1);

        nextnonce=cliUtil.getNonce(nonceManage,accounts[j].address)

        txs=await batchSendTxs(txs,sendCount,cliUtil.generateTx(function([token,from,to,amount,nextnonce]){
          return token.connect(to).transferFrom(from.address,to.address,amount,{nonce:nextnonce});
            },tokenInsArray[i],accounts[j+1],accounts[j],amount,nextnonce));
      }
    }
    txs=await batchSendTxs(txs,sendCount,0);
  }else{

    cliUtil.ensurePath(txbase + '/mint');
    const handle_token_mint = cliUtil.newFile(txbase + '/mint/mint.out');
    
    cliUtil.ensurePath(txbase + '/transfer');
    const handle_transfer=cliUtil.newFile(txbase + '/transfer/transfer.out')

    cliUtil.ensurePath(txbase + '/approve');
    const handle_swap_token_approve=cliUtil.newFile(txbase + '/approve/approve.out')

    cliUtil.ensurePath(txbase + '/transfer-from');
    const handle_transfer_from=cliUtil.newFile(txbase + '/transfer-from/transfer-from.out')

    let pk,signer,pk1,signer1

    for (i=0;i<tokenCount;i++) {
      for(j=0;j+1<accountsLength;j=j+2){
        amount=ethers.utils.parseUnits("1", 18).mul(j%4+1);
        console.log(`swap: ${amount} at i:${i} j:${j}`);

        signer = new ethers.Wallet(pks[j], provider);
        signer1 = new ethers.Wallet(pks[j+1], provider);

        //mint
        nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
        tx = await tokenInsArray[i].populateTransaction.mint(accounts[j].address,amount,{nonce:nextnonce});
        await cliUtil.writePreSignedTxFile(handle_token_mint,signerCreator,tx);
        
        //transfer
        nextnonce=cliUtil.getNonce(nonceManage,accounts[j].address)
        tx = await tokenInsArray[i].connect(accounts[j]).populateTransaction.transfer(accounts[j+1].address,amount,{nonce:nextnonce});
        await cliUtil.writePreSignedTxFile(handle_transfer,signer,tx);

        //approve
        nextnonce=cliUtil.getNonce(nonceManage,accounts[j+1].address)
        tx = await tokenInsArray[i].connect(accounts[j+1]).populateTransaction.approve(accounts[j].address,amount,{nonce:nextnonce});
        await cliUtil.writePreSignedTxFile(handle_swap_token_approve,signer1,tx);

        //transferFrom
        nextnonce=cliUtil.getNonce(nonceManage,accounts[j].address)
        tx = await tokenInsArray[i].connect(accounts[j]).populateTransaction.transferFrom(accounts[j+1].address,accounts[j].address,amount,{nonce:nextnonce});
        await cliUtil.writePreSignedTxFile(handle_transfer_from,signer,tx);

      }
    }
    
  }
  
  
}

async function batchSendTxs(txs,batchCounts,tx){
  if(tx!=0) txs.push(tx);
  if(txs.length>=batchCounts){
    await cliUtil.waitingTxs(txs);
    console.log(`send successful ${txs.length}`);
    txs=new Array();
  }
  return txs;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
