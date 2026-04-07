const hre = require("hardhat");
var cliUtil = require('@arcologynetwork/cli-util/utils/util')


async function main() {  
  const {rpcUrl,pks}=cliUtil.parseNetworkV2(hre)
  accounts = await ethers.getSigners(); 
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const pkCreator=pks[0]
  const signerCreator = new ethers.Wallet(pkCreator, provider);
  const txbase = 'benchmark/uniswap/txs';
  cliUtil.ensurePath(txbase);
  


  const tokenCount=10;  //Token number
  const poolStyle=2;    //Liquidity Pool Organization
                        // 2 - (tokenA tokenB)  (tokenC tokenD)   
                        // 1 - (tokenA tokenB)  (tokenB tokenC)  (tokenC tokenD)

  const flag0_poolInit=true;
  const flag1_liquidity_mint=true;
  const flag2_swap=false;

  const nonceManage=await cliUtil.InitNonces(pks,provider)

  const [swapfactory,nonfungiblePositionManager,router,nettingEngine] = await deployBaseContract(nonceManage);

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
  
  console.log('===========start create UniswapV3Pool=====================')
  const fee=3000;  
  var poolAdrArray=new Array();
  let PoolCreatedDate,strlen,poolAddress;
  for (i=0;i+1<tokenCount;i=i+poolStyle) {
      nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
      tx = await swapfactory.createPool(tokenInsArray[i].address, tokenInsArray[i+1].address, fee,{nonce:nextnonce});
      receipt = await tx.wait();
      // console.log(receipt);
      cliUtil.showResult(cliUtil.parseReceipt(receipt));
      poolAddress=parseEvent(receipt,swapfactory,"PoolCreated");
      console.log(`UniswapV3Pool created at ${poolAddress}, token${i}<--->>token${i+1} fee:${fee}`);
      poolAdrArray.push(poolAddress); 
  }

  console.log('===========start init UniswapV3Pool in nettingEngine=====================')
  for (i=0;i<poolAdrArray.length;i++)  {
      nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
      tx = await nettingEngine.initPool(poolAdrArray[i],tokenInsArray[i*2].address, tokenInsArray[i*2+1].address,{nonce:nextnonce});
      receipt = await tx.wait();
      cliUtil.showResult(cliUtil.parseReceipt(receipt));
      console.log(`Init UniswapV3Pool at ${poolAdrArray[i]} in nettingEngine`);
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
      nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
      txs.push(cliUtil.generateTx(function([pool,sqrtPriceX96,nextnonce]){
        return pool.initialize(sqrtPriceX96,{nonce:nextnonce});
      },poolArray[i],sqrtPriceX96,nextnonce));
    }
    await cliUtil.waitingTxs(txs);
  }
  
  // console.log('===========start mint token for addLiquidity=====================')
  
  let mintAmount=ethers.utils.parseUnits("80000000", 18)
  // let mintAmount=ethers.utils.parseUnits("8000", 18)
  let amountA ,amountB
  if(flag1_liquidity_mint){
    console.log('===========start mint token=====================')
    var txs=new Array();
    for (i=0;i+1<tokenCount;i=i+poolStyle) {
      [amountA ,amountB]=computeMintAmount(tokenInsArray[i].address,tokenInsArray[i+1].address,mintAmount,price);

      nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
      txs.push(cliUtil.generateTx(function([token,receipt,amount,nextnonce]){
        return token.mint(receipt,amount,{nonce:nextnonce});
      },tokenInsArray[i],accounts[i].address,amountA,nextnonce));

      nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
      txs.push(cliUtil.generateTx(function([token,receipt,amount,nextnonce]){
        return token.mint(receipt,amount,{nonce:nextnonce});
      },tokenInsArray[i+1],accounts[i].address,amountB,nextnonce));
    }
    await cliUtil.waitingTxs(txs);

    console.log('===========start approve token=====================')
    txs=new Array();
    for (i=0;i+1<tokenCount;i=i+poolStyle) {
      [amountA ,amountB]=computeMintAmount(tokenInsArray[i].address,tokenInsArray[i+1].address,mintAmount,price);

      nextnonce=cliUtil.getNonce(nonceManage,accounts[i].address)
      txs.push(cliUtil.generateTx(function([token,from,nonfungiblePositionManagerAdr,amount,nextnonce]){
        return token.connect(from).approve(nonfungiblePositionManagerAdr,amount,{nonce:nextnonce});
      },tokenInsArray[i],accounts[i],nonfungiblePositionManager.address,amountA,nextnonce));

      nextnonce=cliUtil.getNonce(nonceManage,accounts[i].address)
      txs.push(cliUtil.generateTx(function([token,from,nonfungiblePositionManagerAdr,amount,nextnonce]){
        return token.connect(from).approve(nonfungiblePositionManagerAdr,amount,{nonce:nextnonce});
      },tokenInsArray[i+1],accounts[i],nonfungiblePositionManager.address,amountB,nextnonce));
    }
    await cliUtil.waitingTxs(txs);

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
    nextnonce=cliUtil.getNonce(nonceManage,accounts[i].address)
    tx = await nonfungiblePositionManager.connect(from).mint(params, {
      gasLimit: 500000000,
      nonce:nextnonce,
    });
    receipt=await tx.wait();
    cliUtil.showResult(cliUtil.parseReceipt(receipt));
  }
  
  console.log('===========after addLiquidity=====================')
  for (i=0;i+1<tokenCount;i=i+poolStyle) {
    await getBalance(tokenInsArray[i],accounts[i],i);
    await getBalance(tokenInsArray[i+1],accounts[i],i+1);
  }
  
  //-------------------------------for swap----------------------------------
  let accountsLength=accounts.length
  if(flag2_swap){
    console.log('===========start mint token=====================')
    let j;
    for (i=0;i+1<tokenCount;i=i+poolStyle) {
      var txs=new Array();
      for(j=0;j+1<accountsLength;j=j+2){
        mintAmount=ethers.utils.parseUnits("1", 18).mul(j+1);
        // console.log(`mint token for swap: ${mintAmount} at i:${i} j:${j}`);
        [amountA ,amountB]=computeMintAmount(tokenInsArray[i].address,tokenInsArray[i+1].address,mintAmount,price);

        nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
        txs.push(cliUtil.generateTx(function([token,receipt,amount,nextnonce]){
          return token.mint(receipt,amount,{nonce:nextnonce});
        },tokenInsArray[i],accounts[j].address,amountA,nextnonce));

        nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
        txs.push(cliUtil.generateTx(function([token,receipt,amount,nextnonce]){
          return token.mint(receipt,amount,{nonce:nextnonce});
        },tokenInsArray[i+1],accounts[j+1].address,amountB,nextnonce));
      }
      await cliUtil.waitingTxs(txs);
    }


    console.log('===========start approve token=====================')
    
    for (i=0;i+1<tokenCount;i=i+poolStyle) {
      var txs=new Array();
      for(j=0;j+1<accountsLength;j=j+2){
        mintAmount=ethers.utils.parseUnits("1", 18).mul(j+1);
        //console.log(`approve token for swap: ${mintAmount} at i:${i} j:${j}`);
        [amountA ,amountB]=computeMintAmount(tokenInsArray[i].address,tokenInsArray[i+1].address,mintAmount,price);

        nextnonce=cliUtil.getNonce(nonceManage,accounts[j].address)
        txs.push(cliUtil.generateTx(function([token,from,routerAdr,amount,nextnonce]){
          return token.connect(from).approve(routerAdr,amount,{nonce:nextnonce});
        },tokenInsArray[i],accounts[j],router.address,amountA.mul(2),nextnonce));

        nextnonce=cliUtil.getNonce(nonceManage,accounts[j+1].address)
        txs.push(cliUtil.generateTx(function([token,from,routerAdr,amount,nextnonce]){
          return token.connect(from).approve(routerAdr,amount,{nonce:nextnonce});
        },tokenInsArray[i+1],accounts[j+1],router.address,amountB.mul(2),nextnonce));
      }
      await cliUtil.waitingTxs(txs);
    }
    
    console.log('===========before swap=====================')
    for (i=0;i+1<tokenCount;i=i+poolStyle) {
      await getBalance(tokenInsArray[i],accounts[i],i);
      await getBalance(tokenInsArray[i+1],accounts[i],i+1);

      await getBalance(tokenInsArray[i],accounts[i+1],i);
      await getBalance(tokenInsArray[i+1],accounts[i+1],i+1);
    }

    console.log('===========start swap=====================')
    
    for (i=0;i+1<tokenCount;i=i+poolStyle) {
      var txs=new Array();
      for(j=0;j+1<accountsLength;j=j+2){
      // for(j=0;j+1<4;j=j+2){
        mintAmount=ethers.utils.parseUnits("1", 18).mul(j+1);
        // console.log(`swap: ${mintAmount} at i:${i} j:${j}`);
        [amountA ,amountB]=computeMintAmount(tokenInsArray[i].address,tokenInsArray[i+1].address,mintAmount,price);

        nextnonce=cliUtil.getNonce(nonceManage,accounts[j].address)
        txs.push(cliUtil.generateTx(function([nettingEngine,from,tokenA,tokenB,fee,amountIn,nextnonce]){
          return swap(tokenA,tokenB,fee,from,amountIn,nettingEngine,true,nextnonce);
        },nettingEngine,accounts[j],tokenInsArray[i].address,tokenInsArray[i+1].address,fee,amountA,nextnonce));

        nextnonce=cliUtil.getNonce(nonceManage,accounts[j+1].address)
        txs.push(cliUtil.generateTx(function([nettingEngine,from,tokenA,tokenB,fee,amountIn,nextnonce]){
          return swap(tokenA,tokenB,fee,from,amountIn,nettingEngine,true,nextnonce);
        },nettingEngine,accounts[j+1],tokenInsArray[i+1].address,tokenInsArray[i].address,fee,amountB,nextnonce));

      }
      await cliUtil.waitingTxs(txs);
    }

    console.log('===========after swap=====================')
    for (i=0;i+1<tokenCount;i=i+poolStyle) {
      await getBalance(tokenInsArray[i],accounts[i],i);
      await getBalance(tokenInsArray[i+1],accounts[i],i+1);

      await getBalance(tokenInsArray[i],accounts[i+1],i);
      await getBalance(tokenInsArray[i+1],accounts[i+1],i+1);
    }

  }else{
    cliUtil.ensurePath(txbase + '/mint');
    const handle_swap_token_mint = cliUtil.newFile(txbase + '/mint/mint.out');
    cliUtil.ensurePath(txbase + '/approve');
    const handle_swap_token_approve=cliUtil.newFile(txbase + '/approve/approve.out')
    cliUtil.ensurePath(txbase + '/swap');
    const handle_swap=cliUtil.newFile(txbase + '/swap/swap.out')

    let pk,signer,pk1,signer1,params

    for (i=0;i+1<tokenCount;i=i+poolStyle) {
      for(j=0;j+1<accounts.length;j=j+2){
        
        mintAmount=ethers.utils.parseUnits("1", 18).mul(getRandom(4));
        [amountA ,amountB]=computeMintAmount(tokenInsArray[i].address,tokenInsArray[i+1].address,mintAmount,price);
        console.log(`swap: ${mintAmount} at i:${i} j:${j} amountA: ${amountA}  amountB:${amountB} `);
        //mint
        nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
        tx = await tokenInsArray[i].populateTransaction.mint(accounts[j].address,amountA,{gasPrice:255,nonce:nextnonce});
        await cliUtil.writePreSignedTxFile(handle_swap_token_mint,signerCreator,tx);

        nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
        tx = await tokenInsArray[i+1].populateTransaction.mint(accounts[j+1].address,amountB,{gasPrice:255,nonce:nextnonce});
        await cliUtil.writePreSignedTxFile(handle_swap_token_mint,signerCreator,tx);

        //approve
        signer = new ethers.Wallet(pks[j], provider);

        nextnonce=cliUtil.getNonce(nonceManage,accounts[j].address)
        tx = await tokenInsArray[i].connect(accounts[j]).populateTransaction.approve(router.address,amountA,{gasPrice:255,nonce:nextnonce});
        await cliUtil.writePreSignedTxFile(handle_swap_token_approve,signer,tx);


        signer1 = new ethers.Wallet(pks[j+1], provider);
        nextnonce=cliUtil.getNonce(nonceManage,accounts[j+1].address)
        tx = await tokenInsArray[i+1].connect(accounts[j+1]).populateTransaction.approve(router.address,amountB,{gasPrice:255,nonce:nextnonce});
        await cliUtil.writePreSignedTxFile(handle_swap_token_approve,signer1,tx);

        nextnonce=cliUtil.getNonce(nonceManage,accounts[j].address)
        tx = await swap(tokenInsArray[i].address,tokenInsArray[i+1].address,fee,accounts[j],amountA,nettingEngine,false,nextnonce);
        await cliUtil.writePreSignedTxFile(handle_swap,signer,tx);

        nextnonce=cliUtil.getNonce(nonceManage,accounts[j+1].address)
        tx = await swap(tokenInsArray[i+1].address,tokenInsArray[i].address,fee,accounts[j+1],amountB,nettingEngine,false,nextnonce);
        await cliUtil.writePreSignedTxFile(handle_swap,signer1,tx);
      }
      console.log(`create swap txs : ${(i+1)*accounts.length} `);
    }
  }
}

function parseEvent(receipt,contract,eventName){
  if(receipt.hasOwnProperty("status")&&receipt.status==1){
    for (const log of receipt.logs) {
      try {
        const parsed = contract.interface.parseLog(log);
        if(eventName===parsed.name){
          idx=0;
          for(const arg of parsed.args){
              if(idx===4){
                return arg;
              }
              idx=idx+1;
          }
        }
      } catch (e) {
        console.log(e);
      }
    }
  }
  return "";
}

async function swap(tokenA,tokenB,fee,from,amountIn,nettingEngine,isExecute,nextnonce){
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
    return nettingEngine.connect(from).queueSwapRequest(params, {
      // gasLimit: 50000000000 ,
      gasPrice:255,
      nonce:nextnonce,
    });
  }else{
    return nettingEngine.connect(from).populateTransaction.queueSwapRequest(params, {
      // gasLimit: 50000000000 ,
      gasPrice:255,
      nonce:nextnonce,
    });
  }
  

}

function getRandom(seed){
  return Math.floor(Math.random() * seed) + 1;
}
function getLiquidityParams(tokenInsA,tokenInsB,amountA,amountB){
  const tokenA=tokenInsA.address.toLowerCase();
  const tokenB=tokenInsB.address.toLowerCase();


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
  let tx = await token.balanceOf(account.address);
  let receipt=await tx.wait();
  let balance=BigInt(cliUtil.parseEvent(receipt,token,"BalanceQuery"));
  formattedBalance = ethers.utils.formatUnits(balance, decimals);
  console.log(`Balance of account ${account.address}: ${formattedBalance} token${tokenIdx}`);
}

async function deployBaseContract(nonceManage){
  console.log('===========start UniswapV3Factory=====================')
  let nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
  const UniswapV3Factory = await hre.ethers.getContractFactory("UniswapV3Factory");
  const swapfactory = await UniswapV3Factory.deploy({nonce:nextnonce});
  await swapfactory.deployed();
  console.log("UniswapV3Factory deployed to:", swapfactory.address);


  console.log('===========start deploy WETH9=====================');
  nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
  const weth9_factory = await ethers.getContractFactory("WETH9");
  const weth9 = await weth9_factory.deploy({nonce:nextnonce});
  await weth9.deployed();
  console.log(`Deployed WETH9 at ${weth9.address}`);
  const weth9addr=weth9.address

  console.log('===========start deploy NFTDescriptor=====================');
  nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
  const Lib = await ethers.getContractFactory("NFTDescriptor");
  const lib = await Lib.deploy({nonce:nextnonce});
  await lib.deployed();
  console.log(`Deployed NFTDescriptor at ${lib.address}`);
  
  console.log('===========start deploy NonfungibleTokenPositionDescriptor=====================');
  nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
  const nativeCurrencyLabelBytes = ethers.utils.formatBytes32String("ACL");
  const NonfungibleTokenPositionDescriptor_factory = await hre.ethers.getContractFactory("NonfungibleTokenPositionDescriptor", {
    signer: accounts[0],
    libraries: {
      NFTDescriptor: lib.address,
    },
  });
  const nonfungibleTokenPositionDescriptor = await NonfungibleTokenPositionDescriptor_factory.deploy(
    weth9.address,
    nativeCurrencyLabelBytes,
    {nonce:nextnonce}
  );
  await nonfungibleTokenPositionDescriptor.deployed();
  console.log("nonfungibleTokenPositionDescriptor deployed to:", nonfungibleTokenPositionDescriptor.address);
  
  console.log('===========start deploy NonfungiblePositionManager=====================');
  nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
  const NonfungiblePositionManager_factory = await hre.ethers.getContractFactory("NonfungiblePositionManager");
  const nonfungiblePositionManager = await NonfungiblePositionManager_factory.deploy(
    swapfactory.address,   
    weth9.address,
    nonfungibleTokenPositionDescriptor.address ,
    {nonce:nextnonce}              
  );
  await nonfungiblePositionManager.deployed();
  console.log("NonfungiblePositionManager deployed to:", nonfungiblePositionManager.address);

  console.log('===========start deploy SwapRouter=====================');
  nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
  const router_factory = await hre.ethers.getContractFactory("SwapRouter");
  const router = await router_factory.deploy(
    swapfactory.address,   
    weth9.address,
    {nonce:nextnonce}            
  );
  await router.deployed();
  console.log("SwapRouter deployed to:", router.address);

  // console.log('===========start deploy PoolLibary=====================');
  // const pool_Libary = await hre.ethers.getContractFactory("PoolLibary");
  // const poolLibary = await pool_Libary.deploy();
  // await poolLibary.deployed();
  // console.log("poolLibary deployed to:", poolLibary.address);
  
  console.log('===========start deploy Netting=====================');
  nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
  const netting_factory = await hre.ethers.getContractFactory("Netting");
  const netting = await netting_factory.deploy(router.address,{nonce:nextnonce});
  await netting.deployed();
  console.log("SwapCore deployed to:", netting.address);
  
  console.log('===========start deploy NettingEngine=====================');
  nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
  const nettingEngine_factory = await hre.ethers.getContractFactory("NettingEngine");
  const nettingEngine = await nettingEngine_factory.deploy({nonce:nextnonce});
  console.log("NettingEngine deployed to:", nettingEngine.address);

  console.log('===========initialization for NettingEngine=====================');
  nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
  tx = await nettingEngine.init(swapfactory.address,netting.address,{nonce:nextnonce});
  receipt = await tx.wait();
  // console.log(receipt);
  cliUtil.showResult(cliUtil.parseReceipt(receipt));
  
  return [swapfactory,nonfungiblePositionManager,router,nettingEngine]
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
