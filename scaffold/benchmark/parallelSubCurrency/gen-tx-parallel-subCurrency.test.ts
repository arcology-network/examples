import hre from "hardhat";
import { JsonRpcProvider, Wallet, ContractTransactionRequest } from "ethers";
import cliUtil from "@arcologynetwork/cli-util/utils/util";
import ProgressBar from "progress";


async function main() {
  const {rpcUrl,pks}=await cliUtil.parseNetworkV3(hre);
  const { ethers } = await hre.network.connect();
  const accounts = await ethers.getSigners();

  const provider = new JsonRpcProvider(rpcUrl);
  const pk0=await pks[0].getHexString();
  const signerCreator = new Wallet(pk0, provider);

  const txbase = "benchmark/parallelSubCurrency/txs";
  cliUtil.ensurePath(txbase);

  const nonceManage=await cliUtil.InitNoncesV3(ethers,pks,provider)

  console.log("====== start deploying contract ======");
  let nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
  const coinFactory = await ethers.getContractFactory("ParallelCoin");
  const coin = await coinFactory.deploy({nonce:nextnonce});
  await coin.waitForDeployment();
  const coinAddress = await coin.getAddress();
  console.log(`Deployed parallelSubCurrency Test at ${coinAddress}`);

  console.log("====== start generating TXs calling mint ======");
  const accountsLength = accounts.length;
  const bar = new ProgressBar("Generating Tx data [:bar] :percent :etas", {
    total: 100,
    width: 40,
    complete: "*",
    incomplete: " ",
  });

  const percent = accountsLength / 100;
  cliUtil.ensurePath(`${txbase}/mint`);
  const handleMint = cliUtil.newFile(`${txbase}/mint/mint.out`);

  for (let i = 0; i < accountsLength; i++) {
    nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
    const tx: ContractTransactionRequest = await coin.mint.populateTransaction(
      accounts[i].address,
      100,{nonce:nextnonce}
    );

    await cliUtil.writePreSignedTxFile(handleMint, signerCreator, tx);

    if (i > 0 && i % percent === 0) {
      bar.tick(1);
    }
  }

  bar.tick(1);
  if (bar.complete) {
    console.log(`tx data generation completed: ${accountsLength}`);
  }

  console.log("====== start generating TXs calling send ======");
  cliUtil.ensurePath(`${txbase}/send`);
  const handleSend = cliUtil.newFile(`${txbase}/send/send.out`);

  const sendCount = Math.floor(accountsLength / 2);
  const bar1 = new ProgressBar("Generating Tx data [:bar] :percent :etas", {
    total: 100,
    width: 40,
    complete: "*",
    incomplete: " ",
  });

  const percent1 = sendCount / 100;

  for (let i = 0; i < sendCount; i++) {
      const pk=await pks[i].getHexString();
      const signer = new ethers.Wallet(pk, provider);
  
      nextnonce=cliUtil.getNonce(nonceManage,accounts[i].address)
  
      const tx: ContractTransactionRequest = await coin.send.populateTransaction(accounts[i + sendCount].address, 100,{nonce:nextnonce});
  
      await cliUtil.writePreSignedTxFile(handleSend, signer, tx);
  
      if (i > 0 && i % percent1 === 0) {
        bar1.tick(1);
      }
  }

  bar1.tick(1);
  if (bar1.complete) {
    console.log(`tx data generation completed: ${sendCount}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});