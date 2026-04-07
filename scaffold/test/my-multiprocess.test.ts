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
  const MMPFactory = await ethers.getContractFactory("MyMultiProcess");
  const mmp = await MMPFactory.deploy({nonce:nextnonce});
  await mmp.waitForDeployment();
  console.log(`Deployed MyMultiProcess Test at ${await mmp.getAddress()}`);

  let tx, receipt;

  // ====== add(5,2) ======
  console.log("====== start executing TXs calling add(5,2) ======");
  nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
  tx = await mmp.add(5, 2,{nonce:nextnonce});
  receipt = await tx.wait();
  expect(Number(cliUtil.parseEvent(receipt,mmp, "QueryBalance"))).to.equal(10);

  // ====== reset() ======
  console.log("====== start executing TXs calling reset() ======");
  nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
  tx = await mmp.reset({nonce:nextnonce});
  receipt = await tx.wait();
  expect(Number(cliUtil.parseEvent(receipt,mmp, "QueryBalance"))).to.equal(0);

  // ====== add(4,3) ======
  console.log("====== start executing TXs calling add(4,3) ======");
  nextnonce=cliUtil.getNonce(nonceManage,accounts[0].address)
  tx = await mmp.add(4, 3,{nonce:nextnonce});
  receipt = await tx.wait();
  expect(Number(cliUtil.parseEvent(receipt,mmp, "QueryBalance")) ).to.equal(12);

  console.log("✅ All functional test completed successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});