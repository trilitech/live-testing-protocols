import { ethers, upgrades, network } from "hardhat";
import { verifyContract } from "../../utils/verify";
import { logicProxyAddresses } from "../../../helper-hardhat-config";

// The hardhat plugin should track all the upgrade and use the already deployed contract
// to deploy each version only one time and then only swtich target.
async function main() {
  const proxyAddress = logicProxyAddresses[network.name];
  const Logic_positive = await ethers.getContractFactory("Logic_positive");

  // Check if proxy address is valid
  if (!proxyAddress) {
    console.error("Error: the proxy address is not correct: ", proxyAddress);
    return;
  }
  // If the logic negative is already deployed the plugin will use it
  const logic_positive = await upgrades.upgradeProxy(proxyAddress, Logic_positive);
  await logic_positive.waitForDeployment();
  const adminAddress = await upgrades.erc1967.getAdminAddress(proxyAddress);
  const implemAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);

  console.log(`Logic (proxy) address: ${proxyAddress}`);
  console.log(`Logic_positive (implentation / logic) address: ${implemAddress}`);
  console.log(`Logic (admin) address: ${adminAddress}`);

  console.log("\nIf you want to live test it, remember to add the address in the helper-hardhat-config.ts file\n");

  await verifyContract(logic_positive, []);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});