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
  const basicNFT = await ethers.deployContract("BasicNFT", [owner.address]);

  await basicNFT.waitForDeployment();

  console.log(`Basic NFT contract deployed: ${basicNFT.target}`);
  console.log(`Initial owner: ${await basicNFT.owner()}`);

  console.log("\nIf you want to live test it, remember to add the address in the helper-hardhat-config.ts file\n");

  // if not a local chain verify the contract
  if (!developmentChains.includes(network.name)) {
    console.log("Wait before verifying");
    await basicNFT.deploymentTransaction()!.wait(6);
    await verify(await basicNFT.getAddress(), [owner.address]);
  }

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});