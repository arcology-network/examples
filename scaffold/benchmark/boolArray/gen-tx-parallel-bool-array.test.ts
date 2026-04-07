import hre from "hardhat";
import ProgressBar from "progress";
import cliUtil from "@arcologynetwork/cli-util/utils/util";


async function main() {
  const {rpcUrl,pks}=await cliUtil.parseNetworkV3(hre);
  const { ethers } = await hre.network.connect();
  const accounts = await ethers.getSigners();

  const provider = new ethers.JsonRpcProvider(rpcUrl);

  const txBase = "benchmark/boolArray/txs";
  cliUtil.ensurePath(txBase);

  const nonceManage=await cliUtil.InitNoncesV3(ethers,pks,provider)

  console.log("====== start deploying contract ======");
  let nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
  const boolArrayFactory = await ethers.getContractFactory("BoolArray");
  const boolArray = await boolArrayFactory.deploy({nonce:nextnonce});
  await boolArray.waitForDeployment();
  const boolAddress = await boolArray.getAddress();
  console.log(`Deployed BoolArray Test at ${boolAddress}`);

  console.log("====== start generating TXs calling add ======");
  const accountsLength = accounts.length;
  cliUtil.ensurePath(`${txBase}/add`);
  const handleBoolArray = cliUtil.newFile(`${txBase}/add/boolarray.out`);

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

    nextnonce=cliUtil.getNonce(nonceManage,accounts[i].address)

    const tx: ContractTransactionRequest = await boolArray.add.populateTransaction({nonce:nextnonce});

    await cliUtil.writePreSignedTxFile(handleBoolArray, signer, tx);

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