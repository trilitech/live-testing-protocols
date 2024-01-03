import { ethers } from "hardhat";
import { verifyContract } from "../utils/verify";

async function main() {
  const [ owner ] = await ethers.getSigners();
  const basicTestToken = await ethers.deployContract("BasicTestToken", [owner.address]);

  await basicTestToken.waitForDeployment();

  console.log(`Basic test token deployed: ${basicTestToken.target}`);
  console.log(`Initial owner: ${await basicTestToken.owner()}`);

  console.log("\nIf you want to live test it, remember to add the address in the helper-hardhat-config.ts file\n");

  await verifyContract(basicTestToken, [owner.address]);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});