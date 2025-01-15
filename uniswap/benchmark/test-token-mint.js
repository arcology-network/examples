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
  
  for (i=0;i+1<tokenCount;i=i+poolStyle) {
    var txs=new Array();
    for(j=0;j+1<accounts.length;j=j+2){
    // for(j=0;j+1<4;j=j+2){
      mintAmount=ethers.utils.parseUnits("1", 18).mul(j+1);
      amountA=mintAmount
      amountB=mintAmount.mul(4);

      txs.push(frontendUtil.generateTx(function([token,receipt,amount]){
        return token.mint(receipt,amount);
      },tokenInsArray[i],accounts[j].address,amountA));

      // console.log(`Token${i} of accounts${j}`);

      txs.push(frontendUtil.generateTx(function([token,receipt,amount]){
        return token.mint(receipt,amount);
      },tokenInsArray[i+1],accounts[j+1].address,amountB));

      // console.log(`Token${i+1} of accounts${j+1}`);
    }
    await frontendUtil.waitingTxs(txs);
    
  }
  

  console.log('===========start approve token=====================')
  
  for (i=0;i+1<tokenCount;i=i+poolStyle) {
    var txs=new Array();
    for(j=0;j+1<accounts.length;j=j+2){
      mintAmount=ethers.utils.parseUnits("1", 18).mul(j+1);
      amountA=mintAmount
      amountB=mintAmount.mul(4);

      txs.push(frontendUtil.generateTx(function([token,from,routerAdr,amount]){
        return token.connect(from).approve(routerAdr,amount);
      },tokenInsArray[i],accounts[j],accounts[0].address,amountA));

      txs.push(frontendUtil.generateTx(function([token,from,routerAdr,amount]){
        return token.connect(from).approve(routerAdr,amount);
      },tokenInsArray[i+1],accounts[j+1],accounts[0].address,amountB));
    }
    await frontendUtil.waitingTxs(txs);
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
