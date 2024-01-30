import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { blockConfirmation, developmentChains } from "../../../helper-hardhat-config";
import { verify } from "../../../scripts/utils/verify";

// This deploy the Logic proxy system.
// The implementation is set on the "positive" version
// but the proxy can use the "negative" compatible version too.
const deployLogic: DeployFunction = async function(
  hre: HardhatRuntimeEnvironment,
) {
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  // Default version is positive
  const version: "positive" | "negative" = "positive";

  log("----------------------------------------------------");
  log(`Deploying Logic_${version} and waiting for confirmations...`);
  // As "proxy" is not an empty object, the plugin will deploy the proxy system
  // automatically. The "contract" key is used here to manage the version of the
  // implementation (logic) contract. You can specify the "version" parameter to
  // change from one version to the other
  const logic = await deploy("Logic", {
    contract: version == "positive" ? "contracts/proxies/transparent/Logic_positive.sol:Logic_positive" : "contracts/proxies/transparent/Logic_negative.sol:Logic_negative",
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
    await verify(logic.address, []);
  }
};

export default deployLogic;
deployLogic.tags = ["all", "proxies", "transparent", "Logic"];