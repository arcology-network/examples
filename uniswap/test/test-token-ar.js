const hre = require("hardhat");
var frontendUtil = require('@arcologynetwork/frontend-util/utils/util')
const nets = require('../network.json');

async function main() {
  
  accounts = await ethers.getSigners(); 
 
  
  let i,tx,txs;
  const tokenCount=10;  //Token number
  const poolStyle=2;    //Liquidity Pool Organization

  console.log('===========start create Token=====================')
  const tokenFactory = await ethers.getContractFactory("Token");
  var tokenInsArray=new Array();
  for(i=0;i<tokenCount;i++){
    const tokenIns = await tokenFactory.deploy("token"+i, "TKN"+i);
    await tokenIns.deployed();
    tokenInsArray.push(tokenIns);
    console.log(`Deployed token${i} at ${tokenIns.address}`);
  }

  console.log('===========start mint token=====================')
  let j;
  let accountsLength=accounts.length
  txs=new Array();
  amountA=1
  amountB=2
  frontendUtil.ensurePath('data/swap-mint');
  const handle_swap_token_mint=frontendUtil.newFile('data/swap-mint/swap-token-mint.out')
  const provider = new ethers.providers.JsonRpcProvider(nets[hre.network.name].url);
  const pkCreator=nets[hre.network.name].accounts[0]
  const signerCreator = new ethers.Wallet(pkCreator, provider);
  frontendUtil.ensurePath('data');

  for (i=0;i+1<tokenCount;i=i+poolStyle) {
    for(j=0;j+1<accountsLength;j=j+2){
      // txs.push(frontendUtil.generateTx(function([token,receipt,amount]){
      //   return token.mint(receipt,amount);
      // },tokenInsArray[i],accounts[j].address,amountA));

      // txs.push(frontendUtil.generateTx(function([token,receipt,amount]){
      //   return token.mint(receipt,amount);
      // },tokenInsArray[i+1],accounts[j+1].address,amountB));

      //mint
      tx = await tokenInsArray[i].populateTransaction.mint(accounts[j].address,amountA);
      await writePreSignedTxFile(handle_swap_token_mint,signerCreator,tx);

      tx = await tokenInsArray[i+1].populateTransaction.mint(accounts[j+1].address,amountB);
      await writePreSignedTxFile(handle_swap_token_mint,signerCreator,tx);
    }
    
  }
  await frontendUtil.waitingTxs(txs);
  
}

async function writePreSignedTxFile(txfile,signer,tx){
  const fulltx=await signer.populateTransaction(tx)
  const rawtx=await signer.signTransaction(fulltx)
  frontendUtil.appendTo(txfile,rawtx+',\n')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
