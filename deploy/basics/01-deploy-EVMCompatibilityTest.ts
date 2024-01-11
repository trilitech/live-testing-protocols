import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { blockConfirmation, developmentChains, universalNumber } from "../../helper-hardhat-config";
import { verify } from "../../scripts/utils/verify";

const deployEVMCompatibilityTest: DeployFunction = async function(
  hre: HardhatRuntimeEnvironment
) {
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log("----------------------------------------------------");
  log("Deploying EVMCompatibilityTest and waiting for confirmations...");
  const evmCompatibilityTest = await deploy("EVMCompatibilityTest", {
    from: deployer,
    args: [universalNumber],
    log: true,
    // we need to wait if on a live network so we can verify properly
    waitConfirmations: blockConfirmation[network.name] || 1,
  });

  // verify if not on a local chain
  if (!developmentChains.includes(network.name)) {
    console.log("Wait before verifying");
    await verify(evmCompatibilityTest.address, [universalNumber]);
  }
};

export default deployEVMCompatibilityTest;
deployEVMCompatibilityTest.tags = ["all", "basics", "EVMCompatibilityTest"];