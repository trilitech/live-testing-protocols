import { ethers } from "hardhat";
import { verifyContract } from "../utils/verify";

async function main() {
  const [ owner ] = await ethers.getSigners();
  const basicNFT = await ethers.deployContract("BasicNFT", [owner.address]);

  await basicNFT.waitForDeployment();

  console.log(`Basic NFT contract deployed: ${basicNFT.target}`);
  console.log(`Initial owner: ${await basicNFT.owner()}`);

  console.log("\nIf you want to live test it, remember to add the address in the helper-hardhat-config.ts file\n");

  await verifyContract(basicNFT, [owner.address]);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});