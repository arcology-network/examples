const hre = require("hardhat");
var frontendUtil = require('@arcologynetwork/frontend-util/utils/util')
const nets = require('../network.json');

async function main() {
  accounts = await ethers.getSigners(); 
  const provider = new ethers.providers.JsonRpcProvider(nets[hre.network.name].url);

    const cum_factory = await ethers.getContractFactory("Cum256");
    const cum = await cum_factory.deploy();
    await cum.deployed();
    console.log(`Deployed Cum Test at ${cum.address}`)

    
    var txs=new Array();
    let i,j,tx,receipt;

    const createTxs=true;

    if(createTxs){
      frontendUtil.ensurePath('data/cum256-add');
      const handle_add=frontendUtil.newFile('data/cum256-add/cum256-add.out')
      const counter=10;
      for (j=0;j<counter;j++) {
        for(i=0;i<accounts.length;i++){
          //add
          pk=nets[hre.network.name].accounts[i];
          signer = new ethers.Wallet(pk, provider);

          tx = await cum.connect(accounts[i]).populateTransaction.add(j);
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