import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { blockConfirmation, developmentChains } from "../../../helper-hardhat-config";
import { verify } from "../../../scripts/utils/verify";
import { ethers, upgrades } from "hardhat";
import { ILogic } from "../../../typechain-types";

const deployLogic_positive: DeployFunction = async function(
  hre: HardhatRuntimeEnvironment
) {
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log("----------------------------------------------------");
  log("Deploying Logic_positive and waiting for confirmations...");
  const logic_positive = await deploy("Logic_positive", {
    from: deployer,
    proxy: {
      execute: {
        init: {
          methodName: "initalValue",
          args: [42]
        }
      },
      proxyContract: "OpenZeppelinTransparentProxy",
    },
    log: true,
    // we need to wait if on a live network so we can verify properly
    waitConfirmations: blockConfirmation[network.name] || 1,
  });

  // verify if not on a local chain
  if (!developmentChains.includes(network.name)) {
    console.log("Wait before verifying");
    await verify(logic_positive.address, []);
  }
};

export default deployLogic_positive;
deployLogic_positive.tags = ["all", "proxies", "transparent", "Logic_positive"];