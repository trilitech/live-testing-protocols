import { network, run } from "hardhat";
import { BaseContract } from "ethers";
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

export const verifyContract = async (contract: BaseContract, args: any[]) => {
  if (!developmentChains.includes(network.name)) {
    console.log("Wait before verifying");
    await contract.deploymentTransaction()?.wait(6);
    await verify(await contract.getAddress(), args);
  }
}