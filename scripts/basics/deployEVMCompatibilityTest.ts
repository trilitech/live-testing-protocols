import { ethers } from "hardhat";
import { universalNumber } from "../../helper-hardhat-config";
import { verifyContract } from "../utils/verify";

async function main() {
  const evmCompatibilityTest = await ethers.deployContract("EVMCompatibilityTest", [universalNumber]);

  await evmCompatibilityTest.waitForDeployment();

  console.log(`EVM Compatibility tests deployed: ${evmCompatibilityTest.target}`);
  console.log(`Initial number: ${await evmCompatibilityTest.universalNumber()}`);

  console.log("\nIf you want to live test it, remember to add the address in the helper-hardhat-config.ts file\n");

  await verifyContract(evmCompatibilityTest, [universalNumber]);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});