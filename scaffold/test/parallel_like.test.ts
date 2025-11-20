// import hre from "hardhat";
import { expect } from "chai";
import frontendUtil from "@arcologynetwork/frontend-util/utils/util";
import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  const accounts = await ethers.getSigners();

  console.log("====== start deploying contract ======");
  const LikeFactory = await ethers.getContractFactory("Like");
  const likeContract = await LikeFactory.deploy();
  await likeContract.waitForDeployment(); // 
  console.log(`Deployed Like Test at ${await likeContract.getAddress()}`);

  console.log("====== start executing TXs calling like ======");
  const txs: Promise<any>[] = [];

  for (let i = 1; i <= 10; i++) {
    txs.push(
      frontendUtil.generateTx(
        function ([bt, from]: [any, any]) {
          return bt.connect(from).like();
        },
        likeContract,
        accounts[i]
      )
    );
  }

  await frontendUtil.waitingTxs(txs);
  expect(await likeContract.getTotal()).to.equal(10);
  console.log("✅ All functional test completed successfully.");
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});