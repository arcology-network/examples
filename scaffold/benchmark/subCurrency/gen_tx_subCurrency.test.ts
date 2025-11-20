import hre from "hardhat";
import ProgressBar from "progress";
import frontendUtil from "@arcologynetwork/frontend-util/utils/util";

async function parseNetwork(hre){
    const networkName = process.env.HARDHAT_NETWORK || "hardhat";
    const netCfg = hre.config.networks[networkName];
    if (!netCfg?.url) {
        throw new Error(`Network URL not found for network: ${networkName}`);
    }
    const rpcUrl = await netCfg.url.getUrl();
    const pks = netCfg.accounts;
    return {rpcUrl,pks}
}

async function main() {
  const {rpcUrl,pks}=await parseNetwork(hre);
  const { ethers } = await hre.network.connect();
  const accounts = await ethers.getSigners();

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const pk0=await pks[0].getHexString();
  const signerCreator = new ethers.Wallet(pk0, provider);

  const txBase = "benchmark/subCurrency/txs";
  frontendUtil.ensurePath(txBase);

  console.log("====== start deploying contract ======");
  const coinFactory = await ethers.getContractFactory("Coin");
  const coin = await coinFactory.deploy();
  await coin.waitForDeployment();
  console.log(`Deployed SubCurrency Test at ${coin.address}`);

  console.log("====== start generating TXs calling mint ======");

  const accountsLength = accounts.length;
  frontendUtil.ensurePath(`${txBase}/mint`);
  const handleMint = frontendUtil.newFile(`${txBase}/mint/mint.out`);

  const bar = new ProgressBar("Generating Tx data [:bar] :percent :etas", {
    total: 100,
    width: 40,
    complete: "*",
    incomplete: " ",
  });

  const percent = Math.max(1, Math.floor(accountsLength / 100));

  for (let i = 0; i < accountsLength; i++) {
    const tx: ContractTransactionRequest = await coin.mint.populateTransaction(accounts[i].address, 100);

    await frontendUtil.writePreSignedTxFile(handleMint, signerCreator, tx);

    if (i > 0 && i % percent === 0) {
      bar.tick(1);
    }
  }

  bar.tick(1);
  if (bar.complete) {
    console.log(`tx data generation completed: ${accountsLength}`);
  }

  console.log("====== start generating TXs calling send ======");
  frontendUtil.ensurePath(`${txBase}/send`);
  const handleSend = frontendUtil.newFile(`${txBase}/send/send.out`);

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

    const tx: ContractTransactionRequest = await coin.mint.populateTransaction(accounts[i + sendCount].address, 100);

    await frontendUtil.writePreSignedTxFile(handleSend, signer, tx);

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