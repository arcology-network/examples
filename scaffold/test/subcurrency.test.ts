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
  const CoinFactory = await ethers.getContractFactory("Coin");
  const coin = await CoinFactory.deploy({nonce:nextnonce});
  await coin.waitForDeployment(); // 
  console.log(`Deployed SubCurrency at ${await coin.getAddress()}`);

  let txs: Promise<any>[] = [];

  // ====== mint ======
  console.log("====== start executing TXs calling mint ======");
  for (let i = 1; i <= 5; i++) {
    nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
    txs.push(
      cliUtil.generateTx(
        function ([coin, to, val,nextnonce]: [any, any, number,any]) {
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
    nextnonce=cliUtil.getNonce(nonceManage,accounts[i].address)
    txs.push(
      cliUtil.generateTx(
        function ([coin, from, to, val,nextnonce]: [any, any, any, number,any]) {
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