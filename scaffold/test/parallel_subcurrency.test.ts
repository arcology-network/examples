import hre from "hardhat";
import { network } from "hardhat";
import frontendUtil from "@arcologynetwork/frontend-util/utils/util";
import { expect } from "chai";

async function main() {
  const { ethers } = await network.connect();
  const accounts = await ethers.getSigners();

  console.log("====== start deploying contract ======");
  const coinFactory = await ethers.getContractFactory("ParallelCoin");
  const coin = await coinFactory.deploy();
  await coin.waitForDeployment();

  const coinAddress = await coin.getAddress();
  console.log(`Deployed parallelSubCurrency at ${coinAddress}`);

  let receipt, txs: any[] = [];

  console.log("====== start executing TXs calling mint ======");
  txs = [];

  for (let i = 1; i <= 5; i++) {
    txs.push(
      frontendUtil.generateTx(
        function ([coin, to, val]: any[]) {
          return coin.mint(to.address, val);
        },
        coin,
        accounts[i],
        100 + i
      )
    );
  }

  await frontendUtil.waitingTxs(txs);

  const expectedBals = [101, 102, 103, 104, 105, 0, 0, 0, 0, 0];

  for (let i = 1; i <= 10; i++) {
    const tx = await coin.getter(await accounts[i].getAddress());
    receipt = await tx.wait();
    expect(frontendUtil.parseEvent(receipt, coin, "Balance")).to.equal(
      expectedBals[i - 1]
    );
  }

  console.log("====== start executing TXs calling send ======");
  txs = [];

  for (let i = 1; i <= 5; i++) {
    txs.push(
      frontendUtil.generateTx(
        function ([coin, from, to, val]: any[]) {
          return coin.connect(from).send(to.address, val);
        },
        coin,
        accounts[i],
        accounts[i + 5],
        100 + i
      )
    );
  }

  await frontendUtil.waitingTxs(txs);

  const expectedBals2 = [0, 0, 0, 0, 0, 101, 102, 103, 104, 105];

  for (let i = 1; i <= 10; i++) {
    const tx = await coin.getter(await accounts[i].getAddress());
    receipt = await tx.wait();
    expect(frontendUtil.parseEvent(receipt, coin, "Balance")).to.equal(
      expectedBals2[i - 1]
    );
  }

  console.log("✅ All functional test completed successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});