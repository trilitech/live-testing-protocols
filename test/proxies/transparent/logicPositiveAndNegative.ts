import { deployments, network } from "hardhat";
import { expect } from "chai";
import { Logic_positive, Logic_negative } from "../../../typechain-types";
import { developmentChains } from "../../../helper-hardhat-config";

const setup = deployments.createFixture(async ({deployments, getNamedAccounts, ethers}, options) => {
  if (developmentChains.includes(network.name))
    await deployments.fixture(); // ensure you start from a fresh deployments
  const { deployer } = await getNamedAccounts();
  const { deploy } = deployments;
  const logicProxy = await ethers.getContract('Logic', deployer) as Logic_positive | Logic_negative; // proxy
  const logicImplem = await ethers.getContract('Logic_Implementation', deployer) as Logic_positive | Logic_negative; // implem

  return { deployer, deploy, logicProxy, logicImplem };
});

describe('Logic (transparent proxy)', () => {
  describe("Delegate calls", function () {
    it("Should modify the value", async function () {
      const { logicProxy, logicImplem } = await setup();
      // Snaphot all the value before delegate call
      const initialValue = await logicProxy.getNumber();
      const initialValueImplem = await logicImplem.getNumber();

      await (await logicProxy.modify()).wait();
      // Depending on version, you will increase or decrease the number
      if (await logicProxy.version() == "positive")
        expect(await logicProxy.getNumber()).to.equal(initialValue + 1n);
      else
        expect(await logicProxy.getNumber()).to.equal(initialValue - 1n);
      expect(await logicImplem.getNumber()).to.equal(initialValueImplem);
    }).timeout(100000);
  });

  // The "Upgrade" refer to the system of upgrading the proxy.
  // In reality in our case, we just alternate/switch from a version to
  // the other ("positive" <-> "negative").
  describe("Upgrade", function () {
    it("Should upgrade the version and modify with the new one", async function () {
      const { deployer, deploy, logicProxy } = await setup();
      // Snaphot all the value before the upgrade and delegate call
      const initialValue = await logicProxy.getNumber();
      const oldVersion = await logicProxy.version();
    
      // Upgrade version
      // The upgrade should happen on the "logicProxy" so don't store the return
      await deploy("Logic", {
        contract: oldVersion == "negative" ? "contracts/proxies/transparent/Logic_positive.sol:Logic_positive" : "contracts/proxies/transparent/Logic_negative.sol:Logic_negative",
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
        log: false,
        // // we need to wait if on a live network so we can verify properly
        // waitConfirmations: blockConfirmation[network.name] || 1,
      });

      // Check new version
      const newVersion = await logicProxy.version();
      expect(newVersion).to.equal(oldVersion == "positive" ? "negative" : "positive");

      // Modify
      await (await logicProxy.modify()).wait();
      // Depending on version, you will increase or decrease the number
      if (newVersion == "positive")
        expect(await logicProxy.getNumber()).to.equal(initialValue + 1n);
      else
        expect(await logicProxy.getNumber()).to.equal(initialValue - 1n);
    }).timeout(100000);
  });
});