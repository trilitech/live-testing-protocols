import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { blockConfirmation, developmentChains } from "../../helper-hardhat-config";
import { verify } from "../../scripts/utils/verify";

const deployBasicNFT: DeployFunction = async function(
  hre: HardhatRuntimeEnvironment
) {
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log("----------------------------------------------------");
  log("Deploying BasicNFT and waiting for confirmations...");
  const basicNFT = await deploy("BasicNFT", {
    from: deployer,
    args: [deployer],
    log: true,
    // we need to wait if on a live network so we can verify properly
    waitConfirmations: blockConfirmation[network.name] || 1,
  });

  // verify if not on a local chain
  if (!developmentChains.includes(network.name)) {
    console.log("Wait before verifying");
    await verify(basicNFT.address, [deployer]);
  }
};

export default deployBasicNFT;
deployBasicNFT.tags = ["all", "ERC721", "BasicNFT"];