import hre from "hardhat";
import { expect } from "chai";
import cliUtil from "@arcologynetwork/cli-util/utils/util";
// import { network } from "hardhat";

async function main() {
  const {rpcUrl,pks}=await cliUtil.parseNetworkV3(hre);
  const { ethers } = await hre.network.connect();
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const nonceManage=await cliUtil.InitNoncesV3(ethers,pks,provider)
  const accounts = await ethers.getSigners();

  console.log("====== start deploying contract ======");
  let nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
  const LikeFactory = await ethers.getContractFactory("Like");
  const likeContract = await LikeFactory.deploy({nonce:nextnonce});
  await likeContract.waitForDeployment(); // 
  console.log(`Deployed Like Test at ${await likeContract.getAddress()}`);

  console.log("====== start executing TXs calling like ======");
  const txs: Promise<any>[] = [];

  for (let i = 1; i <= 10; i++) {
    nextnonce=cliUtil.getNonce(nonceManage,accounts[i].address)
    txs.push(
      cliUtil.generateTx(
        function ([bt, from,nextnonce]: [any, any,any]) {
          return bt.connect(from).like({nonce:nextnonce});
        },
        likeContract,
        accounts[i],
        nextnonce
      )
    );
  }

  await cliUtil.waitingTxs(txs);
  expect(await likeContract.getTotal()).to.equal(10);
  console.log("✅ All functional test completed successfully.");
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});