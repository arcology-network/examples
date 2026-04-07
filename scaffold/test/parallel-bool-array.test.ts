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
  const BAFactory = await ethers.getContractFactory("BoolArray");
  const ba = await BAFactory.deploy({nonce:nextnonce});
  await ba.waitForDeployment(); // 
  console.log(`Deployed BoolArray Test at ${await ba.getAddress()}`);

  console.log("====== start executing TXs calling add() ======");
  const txs: Promise<any>[] = [];

  for (let i = 1; i <= 10; i++) {
    nextnonce=cliUtil.getNonce(nonceManage,accounts[i].address)
    txs.push(
      cliUtil.generateTx(
        function ([ba, from,nextnonce]: [any, any,any]) {
          return ba.connect(from).add({nonce:nextnonce});
        },
        ba,
        accounts[i],
        nextnonce
      )
    );
  }

  await cliUtil.waitingTxs(txs);

  nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
  const tx = await ba.length({nonce:nextnonce});
  const receipt = await tx.wait();
  const result=cliUtil.parseEvent(receipt, ba,"CounterQuery");
  expect(Number(result)).to.equal(10);
  console.log("✅ All functional test completed successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
