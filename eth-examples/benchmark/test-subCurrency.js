const hre = require("hardhat");
var frontendUtil = require('@arcologynetwork/frontend-util/utils/util')
const nets = require('../network.json');

async function main() {
    accounts = await ethers.getSigners(); 
    const provider = new ethers.providers.JsonRpcProvider(nets[hre.network.name].url);

    const coin_factory = await ethers.getContractFactory("Coin");
    const coin = await coin_factory.deploy();
    await coin.deployed();
    console.log(`Deployed SubCurrency at ${coin.address}`)

    let receipt,i,txs; 
    const createTxs=true;
    
    
    console.log('===========mint=====================')
    txs=new Array();
    let count=0;
    for(i=0;i<accounts.length;i++){
      
      txs.push(frontendUtil.generateTx(function([coin,to,val]){
        return coin.mint(to.address,val);
      },coin,accounts[i],100));
      count++;
      if(count==1000){
        await frontendUtil.waitingTxs(txs);
        count=0;
      }
    }
    if(count>0){
      await frontendUtil.waitingTxs(txs);
    }

    if(createTxs){
      console.log('===========send=====================')
      txs=new Array();

      frontendUtil.ensurePath('data/suncurrency-send');
      const handle_add=frontendUtil.newFile('data/suncurrency-send/suncurrency-send.out')
      const counter=10;
      
      const halfAccounts=Math.floor(accounts.length/2);
      for (j=0;j<counter;j++) {
        for(i=0;i<halfAccounts;i++){
          //add
          pk=nets[hre.network.name].accounts[i];
          signer = new ethers.Wallet(pk, provider);

          tx = await coin.connect(accounts[i]).populateTransaction.send(accounts[i+halfAccounts].address,j);
          await writePreSignedTxFile(handle_add,signer,tx);
        }
        for(i=halfAccounts;i<accounts.length;i++){
          //add
          pk=nets[hre.network.name].accounts[i];
          signer = new ethers.Wallet(pk, provider);

          tx = await coin.connect(accounts[i]).populateTransaction.send(accounts[i-halfAccounts].address,j);
          await writePreSignedTxFile(handle_add,signer,tx);
        }
        console.log(`create add txs : ${j}-${accounts.length} `);
      }
    }
    
    

  }
  async function writePreSignedTxFile(txfile,signer,tx){
    const fulltx=await signer.populateTransaction(tx)
    const rawtx=await signer.signTransaction(fulltx)
    frontendUtil.appendTo(txfile,rawtx+',\n')
  }
  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });