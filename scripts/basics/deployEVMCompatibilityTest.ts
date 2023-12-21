import { ethers, run, network } from "hardhat";
import { developmentChains, universalNumber } from "../../helper-hardhat-config";

const verify = async (contractAddress: string, args: any[]) => {
  console.log("Verifying contract...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e: any) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already verified!");
    } else {
      console.log(e);
    }
  }
}

async function main() {
  const evmCompatibilityTest = await ethers.deployContract("EVMCompatibilityTest", [universalNumber]);

  await evmCompatibilityTest.waitForDeployment();

  console.log(`EVM Compatibility tests deployed: ${evmCompatibilityTest.target}`);
  console.log(`Initial number: ${await evmCompatibilityTest.universalNumber()}`);

  console.log("\nIf you want to live test it, remember to add the address in the helper-hardhat-config.ts file\n");

  // if not a local chain verify the contract
  if (!developmentChains.includes(network.name)) {
    console.log("Wait before verifying");
    await evmCompatibilityTest.deploymentTransaction()!.wait(6);
    await verify(await evmCompatibilityTest.getAddress(), [universalNumber]);
  }

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});