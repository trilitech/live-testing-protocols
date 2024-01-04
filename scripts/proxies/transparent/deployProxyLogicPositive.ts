import { ethers, upgrades } from "hardhat";
import { verifyContract } from "../../utils/verify";

async function main() {
  const Logic_positive = await ethers.getContractFactory("Logic_positive");
  const logic_positive = await upgrades.deployProxy(Logic_positive, [42], { initializer: 'initalValue'});
  await logic_positive.waitForDeployment();
  const proxyAddress = await logic_positive.getAddress();
  const implemAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  const adminAddress = await upgrades.erc1967.getAdminAddress(proxyAddress);

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