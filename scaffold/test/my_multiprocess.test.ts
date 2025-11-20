import { network } from "hardhat";
import frontendUtil from "@arcologynetwork/frontend-util/utils/util";
import { expect } from "chai";

async function main() {
  const { ethers } = await network.connect();
  const accounts = await ethers.getSigners();

  console.log("====== start deploying contract ======");
  const MMPFactory = await ethers.getContractFactory("MyMultiProcess");
  const mmp = await MMPFactory.deploy();
  await mmp.waitForDeployment();
  console.log(`Deployed MyMultiProcess Test at ${await mmp.getAddress()}`);

  let tx, receipt;

  // ====== add(5,2) ======
  console.log("====== start executing TXs calling add(5,2) ======");
  tx = await mmp.add(5, 2);
  receipt = await tx.wait();
  expect(Number(frontendUtil.parseEvent(receipt,mmp, "QueryBalance"))).to.equal(10);

  // ====== reset() ======
  console.log("====== start executing TXs calling reset() ======");
  tx = await mmp.reset();
  receipt = await tx.wait();
  expect(Number(frontendUtil.parseEvent(receipt,mmp, "QueryBalance"))).to.equal(0);

  // ====== add(4,3) ======
  console.log("====== start executing TXs calling add(4,3) ======");
  tx = await mmp.add(4, 3);
  receipt = await tx.wait();
  expect(Number(frontendUtil.parseEvent(receipt,mmp, "QueryBalance")) ).to.equal(12);

  console.log("✅ All functional test completed successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});