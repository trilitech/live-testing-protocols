import {
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers, network, upgrades } from "hardhat";
import { developmentChains } from "../../../helper-hardhat-config";

// Proxy admin data for the transparent proxy system of openzeppelin
import ProxyAdmin from "@openzeppelin/upgrades-core/artifacts/@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol/ProxyAdmin.json";
import { Logic_positive, Logic_negative } from "../../../typechain-types";

if (developmentChains.includes(network.name)) {
  // ------------ Local execution testing ------------
  describe("Positive & Negative Logic (local)", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployFixture() {
      // Contracts are deployed using the first signer/account by default
      const [owner, secondAccount] = await ethers.getSigners();
      const INITIAL_VALUE = 42n;

      const Logic_positive = await ethers.getContractFactory("Logic_positive");
      // this is the proxy contract -> force casted in logic positive
      const logic_positive = await upgrades.deployProxy(Logic_positive, [INITIAL_VALUE], { initializer: 'initalValue'}) as any as Logic_positive;
      const proxyAddress = await logic_positive.getAddress();
      const adminAddress = await upgrades.erc1967.getAdminAddress(proxyAddress);
      const adminContract = new ethers.Contract(adminAddress, ProxyAdmin.abi, owner);
      const implemAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
      const positiveImplemContract = await ethers.getContractAt("Logic_positive", implemAddress, owner);

      return { owner, secondAccount, INITIAL_VALUE, logic_positive, adminContract, positiveImplemContract };
    }

    describe("Deployment", function () {
      it("Should set up the proxy system", async function () {
        const { owner, INITIAL_VALUE, logic_positive, adminContract, positiveImplemContract } = await loadFixture(deployFixture);

        // check initializer
        expect(await logic_positive.number()).to.equal(INITIAL_VALUE);
        // version
        expect(await logic_positive.version()).to.equal("positive");
        // check proxy admin owner
        expect(await adminContract.owner()).to.equal(owner.address);
        // check logic contract is clear
        expect(await positiveImplemContract.number()).to.equal(0);
      });
    });

    describe("Delegate calls", function () {
      it("Should modify the value", async function () {
        const { logic_positive, positiveImplemContract } = await loadFixture(deployFixture);

        const implemInitialValue = await positiveImplemContract.number();
        const initialValue = await logic_positive.number();
        // hard coded positive logic -> so addition
        await logic_positive.modify();
        const implemAfterModificationValue = await positiveImplemContract.number();
        const afterModificationValue = await logic_positive.number();
        // check delegate call worked correctly
        expect(afterModificationValue).to.equal(initialValue + 1n);
        expect(implemAfterModificationValue).to.equal(implemInitialValue);
      });
    });

    describe("Upgrade", function () {
      it("Should upgrade to new version", async function () {
        const { owner, logic_positive } = await loadFixture(deployFixture);

        const valueBeforeUpgrade = await logic_positive.number();

        // upgrade proxy to negative version
        const Logic_negative = await ethers.getContractFactory("Logic_negative");
        const logic_negative = await upgrades.upgradeProxy(await logic_positive.getAddress(), Logic_negative) as any as Logic_negative;
        const implemNegativeAddress = await upgrades.erc1967.getImplementationAddress(await logic_negative.getAddress());
        const negativeImplemContract = await ethers.getContractAt("Logic_negative", implemNegativeAddress, owner);

        const valueAfterUpgrade = await logic_positive.number();

        // check proxy is same address and same value
        expect(await logic_positive.getAddress()).to.equal(await logic_negative.getAddress());
        expect(valueAfterUpgrade).to.equal(valueBeforeUpgrade);
        // version
        expect(await logic_negative.version()).to.equal("negative");

        // test the modify
        await logic_negative.modify();
        // check the result
        expect(await logic_negative.number()).to.equal(valueAfterUpgrade - 1n);
        expect(await negativeImplemContract.number()).to.equal(0);
      });
    });
  });

} else {
  // ------------ Live execution testing ------------
  describe("Positive & Negative Logic (live)", function () {

  });
}