import { network } from "hardhat";
import cliUtil from "@arcologynetwork/cli-util/utils/util";
import { expect } from "chai";
import hre from "hardhat";


async function main() {
  const {rpcUrl,pks}=await cliUtil.parseNetworkV3(hre);
  const { ethers } = await hre.network.connect();
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const nonceManage=await cliUtil.InitNoncesV3(ethers,pks,provider)
  const accounts = await ethers.getSigners();

  console.log("====== start deploying contract ======");
  let nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
  const coinFactory = await ethers.getContractFactory("ParallelCoin");
  const coin = await coinFactory.deploy({nonce:nextnonce});
  await coin.waitForDeployment();

  const coinAddress = await coin.getAddress();
  console.log(`Deployed parallelSubCurrency at ${coinAddress}`);

  let receipt, txs: any[] = [];

  console.log("====== start executing TXs calling mint ======");
  txs = [];

  for (let i = 1; i <= 5; i++) {
    nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
    txs.push(
      cliUtil.generateTx(
        function ([coin, to, val,nextnonce]: any[]) {
          return coin.mint(to.address, val,{nonce:nextnonce});
        },
        coin,
        accounts[i],
        100 + i,
        nextnonce
      )
    );
  }

  await cliUtil.waitingTxs(txs);

  const expectedBals = [101, 102, 103, 104, 105, 0, 0, 0, 0, 0];

  for (let i = 1; i <= 10; i++) {
    const tx = await coin.getter(await accounts[i].getAddress());
    receipt = await tx.wait();
    expect(cliUtil.parseEvent(receipt, coin, "Balance")).to.equal(
      expectedBals[i - 1]
    );
  }

  console.log("====== start executing TXs calling send ======");
  txs = [];

  for (let i = 1; i <= 5; i++) {
    nextnonce=cliUtil.getNonce(nonceManage,accounts[i].address)
    txs.push(
      cliUtil.generateTx(
        function ([coin, from, to, val,nextnonce]: any[]) {
          return coin.connect(from).send(to.address, val,{nonce:nextnonce});
        },
        coin,
        accounts[i],
        accounts[i + 5],
        100 + i,
        nextnonce
      )
    );
  }

  await cliUtil.waitingTxs(txs);

  const expectedBals2 = [0, 0, 0, 0, 0, 101, 102, 103, 104, 105];

  for (let i = 1; i <= 10; i++) {
    const tx = await coin.getter(await accounts[i].getAddress());
    receipt = await tx.wait();
    expect(cliUtil.parseEvent(receipt, coin, "Balance")).to.equal(
      expectedBals2[i - 1]
    );
  }

  console.log("✅ All functional test completed successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});