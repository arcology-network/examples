import { network } from "hardhat";
import frontendUtil from "@arcologynetwork/frontend-util/utils/util";
import { expect } from "chai";

async function main() {
  const { ethers } = await network.connect();
  const accounts = await ethers.getSigners();

  console.log("====== start deploying contract ======");
  const BAFactory = await ethers.getContractFactory("BoolArray");
  const ba = await BAFactory.deploy();
  await ba.waitForDeployment(); // 
  console.log(`Deployed BoolArray Test at ${await ba.getAddress()}`);

  console.log("====== start executing TXs calling add() ======");
  const txs: Promise<any>[] = [];

  for (let i = 1; i <= 10; i++) {
    txs.push(
      frontendUtil.generateTx(
        function ([ba, from]: [any, any]) {
          return ba.connect(from).add();
        },
        ba,
        accounts[i]
      )
    );
  }

  await frontendUtil.waitingTxs(txs);

  const tx = await ba.length();
  const receipt = await tx.wait();
  const result=frontendUtil.parseEvent(receipt, ba,"CounterQuery");
  expect(Number(result)).to.equal(10);
  console.log("✅ All functional test completed successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
