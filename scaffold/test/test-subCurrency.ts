import { network } from "hardhat";
import frontendUtil from "@arcologynetwork/frontend-util/utils/util";
import { expect } from "chai";

async function main() {
  const { ethers } = await network.connect();
  const accounts = await ethers.getSigners();

  console.log("====== start deploying contract ======");
  const CoinFactory = await ethers.getContractFactory("Coin");
  const coin = await CoinFactory.deploy();
  await coin.waitForDeployment(); // 
  console.log(`Deployed SubCurrency at ${await coin.getAddress()}`);

  let txs: Promise<any>[] = [];

  // ====== mint ======
  console.log("====== start executing TXs calling mint ======");
  for (let i = 1; i <= 5; i++) {
    txs.push(
      frontendUtil.generateTx(
        function ([coin, to, val]: [any, any, number]) {
          return coin.mint(to.address, val);
        },
        coin,
        accounts[i],
        100 + i
      )
    );
  }
  await frontendUtil.waitingTxs(txs);

  const expectedBalances1 = [101, 102, 103, 104, 105, 0, 0, 0, 0, 0];
  for (let i = 1; i <= 10; i++) {
    expect(await coin.getter(accounts[i].address)).to.equal(
      expectedBalances1[i - 1]
    );
  }

  // ====== send ======
  console.log("====== start executing TXs calling send ======");
  txs = [];
  for (let i = 1; i <= 5; i++) {
    txs.push(
      frontendUtil.generateTx(
        function ([coin, from, to, val]: [any, any, any, number]) {
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

  const expectedBalances2 = [0, 0, 0, 0, 0, 101, 102, 103, 104, 105];
  for (let i = 1; i <= 10; i++) {
    expect(await coin.getter(accounts[i].address)).to.equal(
      expectedBalances2[i - 1]
    );
  }

  console.log("✅ All functional test completed successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});