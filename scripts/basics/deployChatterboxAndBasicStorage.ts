import { ethers } from "hardhat";
import { verifyContract } from "../utils/verify";

async function main() {
  const basicStorage = await ethers.deployContract("BasicStorage");
  const chatterbox = await ethers.deployContract("Chatterbox", [await basicStorage.getAddress()]);

  await basicStorage.waitForDeployment();
  await chatterbox.waitForDeployment();

  console.log(`BasicStorage deployed: ${basicStorage.target}`);
  console.log(`Chatterbox deployed: ${chatterbox.target}`);
  console.log(`Chatterbox target: ${await chatterbox.basicStorage()}`);

  console.log("\nIf you want to live test it, remember to add the address in the helper-hardhat-config.ts file\n");

  await verifyContract(basicStorage, []);
  await verifyContract(chatterbox, [await basicStorage.getAddress()]);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});