import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { blockConfirmation, developmentChains } from "../../helper-hardhat-config";
import { verify } from "../../scripts/utils/verify";

const deployChatterbox: DeployFunction = async function(
  hre: HardhatRuntimeEnvironment
) {
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log("----------------------------------------------------");
//   const basicStorageAddress = await (await ethers.getContract("BasicStorage")).getAddress();
  const basicStorageAddress = (await deployments.get('BasicStorage')).address;
  if (!basicStorageAddress) {
    console.error("Error: No basic storage contract available, first deploy one beffor deploying chatterbox.");
    return;
  }
  log("Deploying Chatterbox and waiting for confirmations...");
  const chatterbox = await deploy("Chatterbox", {
    from: deployer,
    args: [basicStorageAddress],
    log: true,
    // we need to wait if on a live network so we can verify properly
    waitConfirmations: blockConfirmation[network.name] || 1,
  });
  
  // verify if not on a local chain
  if (!developmentChains.includes(network.name)) {
    console.log("Wait before verifying");
    await verify(chatterbox.address, [basicStorageAddress]);
  }
};

export default deployChatterbox;
deployChatterbox.tags = ["all", "basics", "Chatterbox"];
deployChatterbox.dependencies = ["BasicStorage"]