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
    // console.log(rpcUrl);
    const pks = netCfg.accounts;
    return {rpcUrl,pks}
}

async function main() {
  const {rpcUrl,pks}=await parseNetwork(hre);
  const { ethers } = await hre.network.connect();
  const accounts = await ethers.getSigners();

  const provider = new ethers.JsonRpcProvider(rpcUrl);

  const txBase = "benchmark/boolArray/txs";
  frontendUtil.ensurePath(txBase);

  console.log("====== start deploying contract ======");
  const boolArrayFactory = await ethers.getContractFactory("BoolArray");
  const boolArray = await boolArrayFactory.deploy();
  await boolArray.waitForDeployment();
  console.log(`Deployed BoolArray Test at ${boolArray.address}`);

  console.log("====== start generating TXs calling add ======");
  const accountsLength = accounts.length;
  frontendUtil.ensurePath(`${txBase}/add`);
  const handleBoolArray = frontendUtil.newFile(`${txBase}/add/boolarray.out`);

  const bar = new ProgressBar("Generating Tx data [:bar] :percent :etas", {
    total: 100,
    width: 40,
    complete: "*",
    incomplete: " ",
  });

  const percent = Math.max(1, Math.floor(accountsLength / 100));

  for (let i = 0; i < accountsLength; i++) {
    const pk = await pks[i].getHexString();
    const signer = new ethers.Wallet(pk, provider);

    const tx: ContractTransactionRequest = await boolArray.add.populateTransaction();

    await frontendUtil.writePreSignedTxFile(handleBoolArray, signer, tx);

    if (i > 0 && i % percent === 0) {
      bar.tick(1);
    }
  }

  bar.tick(1);
  if (bar.complete) {
    console.log(`Test data generation completed: ${accountsLength}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});