import { ethers } from "hardhat";
import { verifyContract } from "../utils/verify";

async function main() {
  const createFunctions = await ethers.deployContract("TestCreateFunctions", []);

  await createFunctions.waitForDeployment();

  console.log(`TestCreateFunctions deployed: ${createFunctions.target}`);

  await verifyContract(createFunctions, []);

  // Used to test if an external contract (not the creator) can also call the created contract
  // const callerCreateFunctions = await ethers.deployContract("CallerTestContract", []);

  // await callerCreateFunctions.waitForDeployment();

  // console.log(`CallerTestContract deployed: ${callerCreateFunctions.target}`);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});