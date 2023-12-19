import { ethers, run, network } from "hardhat";
import { developmentChains } from "../../helper-hardhat-config";

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
  const [ owner ] = await ethers.getSigners();
  const basicTestToken = await ethers.deployContract("BasicTestToken", [owner.address]);

  await basicTestToken.waitForDeployment();

  console.log(`Basic test token deployed: ${basicTestToken.target}`);
  console.log(`Initial owner: ${await basicTestToken.owner()}`);

  console.log("\nIf you want to live test it, remember to add the address in the helper-hardhat-config.ts file\n");

  // if not a local chain verify the contract
  if (!developmentChains.includes(network.name)) {
    console.log("Wait before verifying");
    await basicTestToken.deploymentTransaction()!.wait(6);
    await verify(await basicTestToken.getAddress(), [owner.address]);
  }

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});