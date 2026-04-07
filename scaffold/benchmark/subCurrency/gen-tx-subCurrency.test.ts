import hre from "hardhat";
import ProgressBar from "progress";
import cliUtil from "@arcologynetwork/cli-util/utils/util";

async function main() {
  const {rpcUrl,pks}=await cliUtil.parseNetworkV3(hre);
  const { ethers } = await hre.network.connect();
  const accounts = await ethers.getSigners();

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const pk0=await pks[0].getHexString();
  const signerCreator = new ethers.Wallet(pk0, provider);

  const txBase = "benchmark/subCurrency/txs";
  cliUtil.ensurePath(txBase);

  const nonceManage=await cliUtil.InitNoncesV3(ethers,pks,provider)

  console.log("====== start deploying contract ======");
  let nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
  const coinFactory = await ethers.getContractFactory("Coin");
  const coin = await coinFactory.deploy({nonce:nextnonce});
  await coin.waitForDeployment();
  const coinAddress = await coin.getAddress();
  console.log(`Deployed SubCurrency Test at ${coinAddress}`);

  console.log("====== start generating TXs calling mint ======");

  const accountsLength = accounts.length;
  cliUtil.ensurePath(`${txBase}/mint`);
  const handleMint = cliUtil.newFile(`${txBase}/mint/mint.out`);

  const bar = new ProgressBar("Generating Tx data [:bar] :percent :etas", {
    total: 100,
    width: 40,
    complete: "*",
    incomplete: " ",
  });

  const percent = Math.max(1, Math.floor(accountsLength / 100));

  for (let i = 0; i < accountsLength; i++) {
    nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
    const tx: ContractTransactionRequest = await coin.mint.populateTransaction(accounts[i].address, 100,{nonce:nextnonce});

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
  cliUtil.ensurePath(`${txBase}/send`);
  const handleSend = cliUtil.newFile(`${txBase}/send/send.out`);

  const sendCount = Math.floor(accountsLength / 2);
  const bar1 = new ProgressBar("Generating Tx data [:bar] :percent :etas", {
    total: 100,
    width: 40,
    complete: "*",
    incomplete: " ",
  });

  const percent1 = Math.max(1, Math.floor(sendCount / 100));

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
  process.exitCode = 1;
});