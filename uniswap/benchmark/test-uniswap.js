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
  const flag2_swap=true;

  const [swapfactory,nonfungiblePositionManager,router] = await deployBaseContract();

  
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
  
  console.log('===========start create UniswapV3Pool=====================')
  const fee=3000;  
  var poolAdrArray=new Array();
  let PoolCreatedDate,strlen,poolAddress;
  for (i=0;i+1<tokenCount;i=i+poolStyle) {
      tx = await swapfactory.createPool(tokenInsArray[i].address, tokenInsArray[i+1].address, fee);
      receipt = await tx.wait();
      frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
      PoolCreatedDate=frontendUtil.parseEvent(receipt,"PoolCreated");
      strlen=PoolCreatedDate.length;
      poolAddress='0x'+PoolCreatedDate.substring(strlen-40,strlen);
      console.log(`UniswapV3Pool created at ${poolAddress}, token${i}<--->>token${i+1} fee:${fee}`);
      poolAdrArray.push(poolAddress); 
  }

  console.log('===========start initialize UniswapV3Pool=====================')
  let sqrtPriceX96 = ethers.BigNumber.from("79228162514264337593543950336");     //  2^96  1:1
  // const sqrtPriceX96 = ethers.BigNumber.from("158456325028528675187087900672");     // 2^97  4:1
  const sqrtPriceRate=2;
  sqrtPriceX96=sqrtPriceX96.mul(sqrtPriceRate);
  let price=sqrtPriceRate*sqrtPriceRate;

  var poolArray=new Array();
  for (i=0;i<poolAdrArray.length;i++) {
    const pool = await ethers.getContractAt("UniswapV3Pool", poolAdrArray[i]);
    poolArray.push(pool);
  }
  
  if(flag0_poolInit){
    var txs=new Array();
    for (i=0;i<poolArray.length;i++) {
      txs.push(frontendUtil.generateTx(function([pool]){
        return pool.initialize(sqrtPriceX96);
      },poolArray[i]));
    }
    await frontendUtil.waitingTxs(txs);
  }else{
    const handle_pool_init=frontendUtil.newFile('data/pool-init.out')
    for (i=0;i<poolArray.length;i++) {
      tx = await poolArray[i].populateTransaction.initialize(sqrtPriceX96);
      await writePreSignedTxFile(handle_pool_init,signerCreator,tx);
    }
    return
  }
  
  // console.log('===========start mint token for addLiquidity=====================')
  
  let mintAmount=ethers.utils.parseUnits("800000", 18)
  let amountA ,amountB
  if(flag1_liquidity_mint){
    console.log('===========start mint token=====================')
    var txs=new Array();
    for (i=0;i+1<tokenCount;i=i+poolStyle) {
      [amountA ,amountB]=computeMintAmount(tokenInsArray[i].address,tokenInsArray[i+1].address,mintAmount,price);

      txs.push(frontendUtil.generateTx(function([token,receipt,amount]){
        return token.mint(receipt,amount);
      },tokenInsArray[i],accounts[i].address,amountA));

      txs.push(frontendUtil.generateTx(function([token,receipt,amount]){
        return token.mint(receipt,amount);
      },tokenInsArray[i+1],accounts[i].address,amountB));
    }
    await frontendUtil.waitingTxs(txs);

    console.log('===========start approve token=====================')
    txs=new Array();
    for (i=0;i+1<tokenCount;i=i+poolStyle) {
      [amountA ,amountB]=computeMintAmount(tokenInsArray[i].address,tokenInsArray[i+1].address,mintAmount,price);

      txs.push(frontendUtil.generateTx(function([token,from,nonfungiblePositionManagerAdr,amount]){
        return token.connect(from).approve(nonfungiblePositionManagerAdr,amount);
      },tokenInsArray[i],accounts[i],nonfungiblePositionManager.address,amountA));

      txs.push(frontendUtil.generateTx(function([token,from,nonfungiblePositionManagerAdr,amount]){
        return token.connect(from).approve(nonfungiblePositionManagerAdr,amount);
      },tokenInsArray[i+1],accounts[i],nonfungiblePositionManager.address,amountB));
    }
    await frontendUtil.waitingTxs(txs);

  }else{

    frontendUtil.ensurePath('data/token-mint');
    const handle_token_mint=frontendUtil.newFile('data/token-mint/token-mint.out')
    frontendUtil.ensurePath('data/token-approve');
    const handle_token_approve=frontendUtil.newFile('data/token-approve/token-approve.out')

    

    for (i=0;i+1<tokenCount;i=i+poolStyle) {
      [amountA ,amountB]=computeMintAmount(tokenInsArray[i].address,tokenInsArray[i+1].address,mintAmount,price);
      
      tx = await tokenInsArray[i].populateTransaction.mint(accounts[i].address,amountA);
      await writePreSignedTxFile(handle_token_mint,signerCreator,tx);

      tx = await tokenInsArray[i+1].populateTransaction.mint(accounts[i].address,amountB);
      await writePreSignedTxFile(handle_token_mint,signerCreator,tx);

      //-------------------------------------approve-------------------------------------------------
      pk=nets[hre.network.name].accounts[i];
      signer = new ethers.Wallet(pk, provider);

      tx = await tokenInsArray[i].connect(accounts[i]).populateTransaction.approve(nonfungiblePositionManager.address,amountA);
      await writePreSignedTxFile(handle_token_approve,signer,tx);

      tx = await tokenInsArray[i+1].connect(accounts[i]).populateTransaction.approve(nonfungiblePositionManager.address,amountB);
      await writePreSignedTxFile(handle_token_approve,signer,tx);
    }
    return
  }

  console.log('===========before addLiquidity=====================')
  for (i=0;i+1<tokenCount;i=i+poolStyle) {
    await getBalance(tokenInsArray[i],accounts[i],i);
    await getBalance(tokenInsArray[i+1],accounts[i],i+1);
  }

  console.log('===========addLiquidity=====================')
  
  var txs=new Array();
  let token0,token1,amount0Desired,amount1Desired;
  for (i=0;i+1<tokenCount;i=i+poolStyle) {
    [amountA ,amountB]=computeMintAmount(tokenInsArray[i].address,tokenInsArray[i+1].address,mintAmount,price);
    [token0,token1,amount0Desired,amount1Desired]=getLiquidityParams(tokenInsArray[i],tokenInsArray[i+1],amountA,amountB);

    from=accounts[i]

    const params = {
      token0: token0,
      token1: token1,
      fee: fee, 
      tickLower: -887220,
      tickUpper: 887220,
      amount0Desired: amount0Desired, 
      amount1Desired: amount1Desired,
      amount0Min: 0,
      amount1Min: 0,
      recipient: from.address, 
      deadline: Math.floor(Date.now() / 1000) + 60 * 20,
    };
    tx = await nonfungiblePositionManager.connect(from).mint(params, {
      gasLimit: 500000000,
    });
    receipt=await tx.wait();
    frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
  }
  
  console.log('===========after addLiquidity=====================')
  for (i=0;i+1<tokenCount;i=i+poolStyle) {
    await getBalance(tokenInsArray[i],accounts[i],i);
    await getBalance(tokenInsArray[i+1],accounts[i],i+1);
  }
  
  //-------------------------------for swap----------------------------------
  
  if(flag2_swap){
    console.log('===========start mint token=====================')
    let j;
    for (i=0;i+1<tokenCount;i=i+poolStyle) {
      var txs=new Array();
      for(j=0;j+1<accounts.length;j=j+2){
        mintAmount=ethers.utils.parseUnits("1", 18).mul(j+1);
        //console.log(`mint token for swap: ${mintAmount} at i:${i} j:${j}`);
        [amountA ,amountB]=computeMintAmount(tokenInsArray[i].address,tokenInsArray[i+1].address,mintAmount,price);

        txs.push(frontendUtil.generateTx(function([token,receipt,amount]){
          return token.mint(receipt,amount);
        },tokenInsArray[i],accounts[j].address,amountA));

        txs.push(frontendUtil.generateTx(function([token,receipt,amount]){
          return token.mint(receipt,amount);
        },tokenInsArray[i+1],accounts[j+1].address,amountB));
      }
      await frontendUtil.waitingTxs(txs);
    }
    

    console.log('===========start approve token=====================')
    
    for (i=0;i+1<tokenCount;i=i+poolStyle) {
      var txs=new Array();
      for(j=0;j+1<accounts.length;j=j+2){
        mintAmount=ethers.utils.parseUnits("1", 18).mul(j+1);
        //console.log(`approve token for swap: ${mintAmount} at i:${i} j:${j}`);
        [amountA ,amountB]=computeMintAmount(tokenInsArray[i].address,tokenInsArray[i+1].address,mintAmount,price);

        txs.push(frontendUtil.generateTx(function([token,from,routerAdr,amount]){
          return token.connect(from).approve(routerAdr,amount);
        },tokenInsArray[i],accounts[j],router.address,amountA));

        txs.push(frontendUtil.generateTx(function([token,from,routerAdr,amount]){
          return token.connect(from).approve(routerAdr,amount);
        },tokenInsArray[i+1],accounts[j+1],router.address,amountB));
      }
      await frontendUtil.waitingTxs(txs);
    }
    

    console.log('===========start swap=====================')
    
    for (i=0;i+1<tokenCount;i=i+poolStyle) {
      var txs=new Array();
      // for(j=0;j+1<accounts.length;j=j+2){
      for(j=0;j+1<4;j=j+2){
        mintAmount=ethers.utils.parseUnits("1", 18).mul(j+1);
        // console.log(`swap: ${mintAmount} at i:${i} j:${j}`);
        [amountA ,amountB]=computeMintAmount(tokenInsArray[i].address,tokenInsArray[i+1].address,mintAmount,price);

        txs.push(frontendUtil.generateTx(function([swapRouter,from,tokenA,tokenB,fee,amountIn]){
          return swap(tokenA,tokenB,fee,from,amountIn,swapRouter,true);
        },router,accounts[j],tokenInsArray[i].address,tokenInsArray[i+1].address,fee,amountA));

        txs.push(frontendUtil.generateTx(function([swapRouter,from,tokenA,tokenB,fee,amountIn]){
          return swap(tokenA,tokenB,fee,from,amountIn,swapRouter,true);
        },router,accounts[j+1],tokenInsArray[i+1].address,tokenInsArray[i].address,fee,amountB));

      }
      await frontendUtil.waitingTxs(txs);
    }
    

  }else{

    frontendUtil.ensurePath('data/swap-mint');
    const handle_swap_token_mint=frontendUtil.newFile('data/swap-mint/swap-token-mint.out')
    frontendUtil.ensurePath('data/swap-approve');
    const handle_swap_token_approve=frontendUtil.newFile('data/swap-approve/swap-token-approve.out')
    frontendUtil.ensurePath('data/swap');
    const handle_swap=frontendUtil.newFile('data/swap/swap.out')

    let pk,signer,pk1,signer1,params

    for (i=0;i+1<tokenCount;i=i+poolStyle) {
      for(j=0;j+1<accounts.length;j=j+2){
        mintAmount=ethers.utils.parseUnits("1", 18).mul(getRandom(8));
        console.log(`swap: ${mintAmount} at i:${i} j:${j}`);
        [amountA ,amountB]=computeMintAmount(tokenInsArray[i].address,tokenInsArray[i+1].address,mintAmount,price);
        console.log(`amountA: ${amountA}  amountB:${amountB} `);
        //mint
        tx = await tokenInsArray[i].populateTransaction.mint(accounts[j].address,amountA);
        await writePreSignedTxFile(handle_swap_token_mint,signerCreator,tx);

        tx = await tokenInsArray[i+1].populateTransaction.mint(accounts[j+1].address,amountB);
        await writePreSignedTxFile(handle_swap_token_mint,signerCreator,tx);

        //approve
        pk=nets[hre.network.name].accounts[j];
        signer = new ethers.Wallet(pk, provider);

        tx = await tokenInsArray[i].connect(accounts[j]).populateTransaction.approve(router.address,amountA);
        await writePreSignedTxFile(handle_swap_token_approve,signer,tx);

        pk1=nets[hre.network.name].accounts[j+1];
        signer1 = new ethers.Wallet(pk1, provider);

        tx = await tokenInsArray[i+1].connect(accounts[j+1]).populateTransaction.approve(router.address,amountB);
        await writePreSignedTxFile(handle_swap_token_approve,signer1,tx);

        
        tx = await swap(tokenInsArray[i].address,tokenInsArray[i+1].address,fee,accounts[j],amountA,router,false);
        await writePreSignedTxFile(handle_swap,signer,tx);

        tx = await swap(tokenInsArray[i+1].address,tokenInsArray[i].address,fee,accounts[j+1],amountB,router,false);
        await writePreSignedTxFile(handle_swap,signer1,tx);
      }
    }
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


async function swap(tokenA,tokenB,fee,from,amountIn,swapRouter,isExecute){
  const params = {
      tokenIn: tokenA,                
      tokenOut: tokenB,               
      fee: fee,                            
      recipient: from.address,                    
      deadline: Math.floor(Date.now() / 1000) + 60 * 10, 
      amountIn: amountIn, 
      amountOutMinimum: 0,                     
      sqrtPriceLimitX96: 0                     
  };
  if(isExecute){
    // return swapRouter.connect(from).exactInputSingleDefer(params, {
    //   gasLimit: 500000000 
    // });
    return swapRouter.connect(from).exactInputSingleDefer(params);
  }else{
    return swapRouter.connect(from).populateTransaction.exactInputSingleDefer(params, {
      gasLimit: 500000000 
    });
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
  const receipt = await router.deployed();
  // frontendUtil.showResult(frontendUtil.parseReceipt(receipt));
  // console.log(receipt);
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
