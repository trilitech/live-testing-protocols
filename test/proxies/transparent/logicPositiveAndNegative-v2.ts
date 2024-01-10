import { deployments, network } from "hardhat";
import { expect } from "chai";
import { Logic_positive } from "../../../typechain-types";
import { developmentChains } from "../../../helper-hardhat-config";

const setup = deployments.createFixture(async ({deployments, getNamedAccounts, ethers}, options) => {
  if (developmentChains.includes(network.name))
    await deployments.fixture(); // ensure you start from a fresh deployments
  const { deployer } = await getNamedAccounts();
  const logic_positiveProxy = await ethers.getContract('Logic_positive', deployer) as Logic_positive; // proxy
  const logic_positiveImplem = await ethers.getContract('Logic_positive_Implementation', deployer) as Logic_positive; // implem

  console.log("PROXY: ", await logic_positiveProxy.getAddress());
  console.log("IMPLEM: ", await logic_positiveImplem.getAddress());
  return { deployer, logic_positiveProxy, logic_positiveImplem };
});

// This test use the hardhat-deploy plugin which can't handle easily upgrade for tests
// on transparents proxies. If you want to test the upgrade mechanism, you should use
// the upgrade system manually like in the old version of this script.
describe('Positive Logic (transparent proxy)', () => {
  describe("Delegate calls", function () {
    it("Should modify the value", async function () {
      const { logic_positiveProxy, logic_positiveImplem } = await setup();
      // Snaphot all the value before delegate call
      const initialValue = await logic_positiveProxy.getNumber();
      const initialValuePositiveImplem = await logic_positiveImplem.getNumber();

      await (await logic_positiveProxy.modify()).wait();
      expect(await logic_positiveProxy.getNumber()).to.equal(initialValue + 1n);
      expect(await logic_positiveImplem.getNumber()).to.equal(initialValuePositiveImplem);
    }).timeout(100000);
  });
});

