const hre = require("hardhat");
var frontendUtil = require('@arcologynetwork/frontend-util/utils/util')
const nets = require('../network.json');

async function main() {
  
  accounts = await ethers.getSigners(); 
  const provider = new ethers.providers.JsonRpcProvider(nets[hre.network.name].url);
  const pkCreator=nets[hre.network.name].accounts[0]
  const signerCreator = new ethers.Wallet(pkCreator, provider);
  frontendUtil.ensurePath('data');
  


  const tokenCount=4;  //Token number
  const poolCount=5;    //Pool number
  const poolStyle=2;    //Liquidity Pool Organization
                        // 2 - (tokenA tokenB)  (tokenC tokenD)   
                        // 1 - (tokenA tokenB)  (tokenB tokenC)  (tokenC tokenD)

  const flag0_poolInit=true;
  const flag1_liquidity_mint=true;
  const flag2_liquidity_approve=true;
  const flag3_liquidity=true;

  
  let i,tx;

  console.log('===========start create Token=====================')
  const tokenFactory = await ethers.getContractFactory("Token");
  var tokenInsArray=new Array();
  for(i=0;i<tokenCount;i++){
    const tokenIns = await tokenFactory.deploy("token"+i, "TKN"+i);
    await tokenIns.deployed();
    tokenInsArray.push(tokenIns);
    console.log(`Deployed token${i} at ${tokenIns.address}`);
  }
  
  //-------------------------------for swap----------------------------------
  let j;
  console.log('===========start mint token=====================')
  var txs=new Array();
  for (i=0;i<tokenCount;i++) {
    amountA=ethers.utils.parseUnits("1", 18).mul(i+1);
    txs.push(frontendUtil.generateTx(function([token,receipt,amount]){
      return token.mint(receipt,amount);
    },tokenInsArray[i],accounts[i].address,amountA));
  }
  await frontendUtil.waitingTxs(txs);
  
  console.log('===========query balance=====================')
  for (i=0;i<tokenCount;i++) {
    await getBalance(tokenInsArray[i],accounts[i],i);
    await getBalance(tokenInsArray[i],accounts[i+4],i);
  }
  console.log('===========start mint token for add=====================')
  var txs=new Array();
  for (i=0;i<tokenCount;i++) {
    amountA=ethers.utils.parseUnits("1", 18).mul(i+1);
    txs.push(frontendUtil.generateTx(function([token,receipt,amount]){
      return token.mint(receipt,amount);
    },tokenInsArray[i],accounts[i].address,amountA));
  }
  await frontendUtil.waitingTxs(txs);
  
  console.log('===========query balance=====================')
  for (i=0;i<tokenCount;i++) {
    await getBalance(tokenInsArray[i],accounts[i],i);
    await getBalance(tokenInsArray[i],accounts[i+4],i);
  }


  console.log('===========start transfer token=====================')
  var txs=new Array();
  for (i=0;i<tokenCount;i++) {
    amountA=ethers.utils.parseUnits("1", 18).mul(i+1);
    txs.push(frontendUtil.generateTx(function([token,from,to,amount]){
      return token.connect(from).transfer(to,amount);
    },tokenInsArray[i],accounts[i],accounts[i+4].address,amountA));
  }
  await frontendUtil.waitingTxs(txs);

  console.log('===========query balance=====================')
  for (i=0;i<tokenCount;i++) {
    await getBalance(tokenInsArray[i],accounts[i],i);
    await getBalance(tokenInsArray[i],accounts[i+4],i);
  }

  console.log('===========start burn token=====================')
  var txs=new Array();
  for (i=0;i<tokenCount;i++) {
    amountA=ethers.utils.parseUnits("1", 18).mul(i+1);
    txs.push(frontendUtil.generateTx(function([token,to,amount]){
      return token.burn(to,amount);
    },tokenInsArray[i],accounts[i].address,amountA));
    txs.push(frontendUtil.generateTx(function([token,to,amount]){
      return token.burn(to,amount);
    },tokenInsArray[i],accounts[i+4].address,amountA));
  }
  await frontendUtil.waitingTxs(txs);

  console.log('===========query balance=====================')
  for (i=0;i<tokenCount;i++) {
    await getBalance(tokenInsArray[i],accounts[i],i);
    await getBalance(tokenInsArray[i],accounts[i+4],i);
  }

  console.log('===========start mint token for approve=====================')
  var txs=new Array();
  for (i=0;i<tokenCount;i++) {
    amountA=ethers.utils.parseUnits("1", 18).mul(i+1);
    txs.push(frontendUtil.generateTx(function([token,receipt,amount]){
      return token.mint(receipt,amount);
    },tokenInsArray[i],accounts[i].address,amountA));
  }
  await frontendUtil.waitingTxs(txs);
  
  console.log('===========query balance=====================')
  for (i=0;i<tokenCount;i++) {
    await getBalance(tokenInsArray[i],accounts[i],i);
    await getBalance(tokenInsArray[i],accounts[i+4],i);
  }

  console.log('===========start approve =====================')
  var txs=new Array();
  for (i=0;i<tokenCount;i++) {
    amountA=ethers.utils.parseUnits("1", 18).mul(i+1);
    txs.push(frontendUtil.generateTx(function([token,from,receipt,amount]){
      return token.connect(from).approve(receipt,amount)
    },tokenInsArray[i],accounts[i],accounts[i+4].address,amountA));
  }
  await frontendUtil.waitingTxs(txs);
  
  console.log('===========query allowance=====================')
  for (i=0;i<tokenCount;i++) {
    await getAllowance(tokenInsArray[i],accounts[i],accounts[i+4],i);
  }

  console.log('===========start transferFrom token=====================')
  var txs=new Array();
  for (i=0;i<tokenCount;i++) {
    amountA=ethers.utils.parseUnits("1", 18).mul(i+1);
    txs.push(frontendUtil.generateTx(function([token,from,to,amount]){
      return token.connect(to).transferFrom(from.address,to.address,amount);
    },tokenInsArray[i],accounts[i],accounts[i+4],amountA));
  }
  await frontendUtil.waitingTxs(txs);

  console.log('===========query balance=====================')
  for (i=0;i<tokenCount;i++) {
    await getBalance(tokenInsArray[i],accounts[i],i);
    await getBalance(tokenInsArray[i],accounts[i+4],i);
  }

  console.log('===========query allowance=====================')
  for (i=0;i<tokenCount;i++) {
    await getAllowance(tokenInsArray[i],accounts[i],accounts[i+4],i);
  }


}
function getRandom(seed){
  return Math.floor(Math.random() * seed) + 1;
}
function getLiquidityParams(tokenInsA,tokenInsB,amountA,amountB){
  const tokenA=tokenInsA.address;
  const tokenB=tokenInsB.address;

  let amount0Desired=amountA;
  let amount1Desired=amountB;
  let token0,token1;

  if(tokenA < tokenB){
    token0=tokenA;
    token1=tokenB;
  }else{
    token0=tokenB;
    token1=tokenA;

    amount0Desired=amountB;
    amount1Desired=amountA;

  }

  return [token0,token1,amount0Desired,amount1Desired]
}

async function getAllowance(token,owner,spender,tokenIdx){
  const decimals=18;
  allowance = await token.allowance(owner.address,spender.address);
  formattedBalance = ethers.utils.formatUnits(allowance, decimals);
  console.log(`${owner.address} approve to ${spender.address} : ${formattedBalance} token${tokenIdx}`);
}

async function getBalance(token,account,tokenIdx){
  const decimals=18;
  balance = await token.balanceOf(account.address);
  formattedBalance = ethers.utils.formatUnits(balance, decimals);
  console.log(`Balance of account ${account.address}: ${formattedBalance} token${tokenIdx}`);
}

async function deployBaseContract(){
  console.log('===========start UniswapV3Factory=====================')
  const UniswapV3Factory = await hre.ethers.getContractFactory("UniswapV3Factory");
  const swapfactory = await UniswapV3Factory.deploy();
  await swapfactory.deployed();
  console.log("UniswapV3Factory deployed to:", swapfactory.address);


  console.log('===========start deploy WETH9=====================');
  const weth9_factory = await ethers.getContractFactory("WETH9");
  const weth9 = await weth9_factory.deploy();
  await weth9.deployed();
  console.log(`Deployed WETH9 at ${weth9.address}`);
  const weth9addr=weth9.address

  console.log('===========start deploy NFTDescriptor=====================');
  const Lib = await ethers.getContractFactory("NFTDescriptor");
  const lib = await Lib.deploy();
  await lib.deployed();
  console.log(`Deployed NFTDescriptor at ${lib.address}`);
  
  console.log('===========start deploy NonfungibleTokenPositionDescriptor=====================');
  const nativeCurrencyLabelBytes = ethers.utils.formatBytes32String("ACL");
  const NonfungibleTokenPositionDescriptor_factory = await hre.ethers.getContractFactory("NonfungibleTokenPositionDescriptor", {
    signer: accounts[0],
    libraries: {
      NFTDescriptor: lib.address,
    },
  });
  const nonfungibleTokenPositionDescriptor = await NonfungibleTokenPositionDescriptor_factory.deploy(
    weth9.address,
    nativeCurrencyLabelBytes
  );
  await nonfungibleTokenPositionDescriptor.deployed();
  console.log("nonfungibleTokenPositionDescriptor deployed to:", nonfungibleTokenPositionDescriptor.address);
  
  console.log('===========start deploy NonfungiblePositionManager=====================');
  const NonfungiblePositionManager_factory = await hre.ethers.getContractFactory("NonfungiblePositionManager");
  const nonfungiblePositionManager = await NonfungiblePositionManager_factory.deploy(
    swapfactory.address,   
    weth9.address,
    nonfungibleTokenPositionDescriptor.address               
  );
  await nonfungiblePositionManager.deployed();
  console.log("NonfungiblePositionManager deployed to:", nonfungiblePositionManager.address);

  console.log('===========start deploy SwapRouter=====================');
  const router_factory = await hre.ethers.getContractFactory("SwapRouter");
  const router = await router_factory.deploy(
    swapfactory.address,   
    weth9.address            
  );
  await router.deployed();
  console.log("SwapRouter deployed to:", router.address);


  
  return [swapfactory,nonfungiblePositionManager,router]
}



async function writePreSignedTxFile(txfile,signer,tx){
  const fulltx=await signer.populateTransaction(tx)
  const rawtx=await signer.signTransaction(fulltx)
  frontendUtil.appendTo(txfile,rawtx+',\n')
}

function computeMintAmount(token0,token1,amount1,price){
  let amountA,amountB;
  if(token0 < token1){
    amountA=amount1.div(price);
    amountB=amount1;
  }else{
    amountA=amount1;
    amountB=amount1.div(price);
  }
  return [amountA,amountB]
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
