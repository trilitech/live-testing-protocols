import {
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers, network, upgrades } from "hardhat";
import { 
  developmentChains, 
  logicProxyAddresses, 
  logicAdminAddresses, 
  logic_positiveImplemAddresses, 
  logic_negativeImplemAddresses 
} from "../../../helper-hardhat-config";

// Proxy admin data for the transparent proxy system of openzeppelin
import ProxyAdmin from "@openzeppelin/upgrades-core/artifacts/@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol/ProxyAdmin.json";
import { Logic_positive, Logic_negative, ILogic } from "../../../typechain-types";

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
    let owner: any;
    let logicProxyAddress: string;
    let logicProxyContract: ILogic; // use the interface to abstract version
    let adminAddress: string;
    let adminContract;
    let positiveImplemAddress: string;
    let positiveImplemContract: Logic_positive;
    let negativeImplemAddress: string;
    let negativeImplemContract: Logic_negative;
    let initialVersion: string;

    // Can't use fixture outside of local execution
    before(async () => {
      // Users part
      [ owner ] = await ethers.getSigners();

      // Retrieve the contract addresses from the helper-hardhat-config.ts file and instantiate the contracts
      logicProxyAddress = logicProxyAddresses[network.name];
      adminAddress = logicAdminAddresses[network.name];
      positiveImplemAddress = logic_positiveImplemAddresses[network.name];
      negativeImplemAddress = logic_negativeImplemAddresses[network.name];
      if (!logicProxyAddress || !adminAddress || !positiveImplemAddress || !negativeImplemAddress) {
        console.error("Contract address invalid.");
        // revert the execution
        throw new Error('Invalid contract address');
      }
      logicProxyContract = await ethers.getContractAt("ILogic", logicProxyAddress, owner);
      adminContract = new ethers.Contract(adminAddress, ProxyAdmin.abi, owner);
      positiveImplemContract = await ethers.getContractAt("Logic_positive", positiveImplemAddress, owner);
      negativeImplemContract = await ethers.getContractAt("Logic_negative", negativeImplemAddress, owner);

      // Set the version
      initialVersion = await logicProxyContract.version();

      // Check if owner is the real owner (admin) of the proxy
      const adminOfProxy = await adminContract.owner();
      if (adminOfProxy != owner.address) {
        console.log("You should be the admin of the proxy for the tests. Deploy it before runing the command again.");
        throw new Error("Can't run the tests if you're not the admin of the proxy.");
      }
    });

    describe("Delegate calls", function () {
      it("Should modify the value", async function () {
        // Snaphot all the value before delegate call
        const initialValue = await logicProxyContract.getNumber();
        const initialValuePositiveImplem = await positiveImplemContract.getNumber();
        const initialValueNegativeImplem = await negativeImplemContract.getNumber();

        await (await logicProxyContract.modify()).wait();
        if (initialVersion == "positive") {
          expect(await logicProxyContract.getNumber()).to.equal(initialValue + 1n);
          expect(await positiveImplemContract.getNumber()).to.equal(initialValuePositiveImplem);
        }
        else {
          expect(await logicProxyContract.getNumber()).to.equal(initialValue - 1n);
          expect(await negativeImplemContract.getNumber()).to.equal(initialValueNegativeImplem);
        }
      });
    });

    describe("Upgrade", function () {
      it("Should upgrade and after modify the value", async function () {
        // Snaphot all the value before upgrade and delegate call
        const initialValue = await logicProxyContract.getNumber();
        const initialValuePositiveImplem = await positiveImplemContract.getNumber();
        const initialValueNegativeImplem = await negativeImplemContract.getNumber();

        // Upgrade process and check the version changed + no value modification
        if (initialVersion == "positive") {
          const Logic_negative = await ethers.getContractFactory("Logic_negative");
          await (await upgrades.upgradeProxy(logicProxyAddress, Logic_negative)).waitForDeployment();
          expect(await logicProxyContract.version()).to.equal("negative");
        } else {
          const Logic_positive = await ethers.getContractFactory("Logic_positive");
          await (await upgrades.upgradeProxy(logicProxyAddress, Logic_positive)).waitForDeployment();
          expect(await logicProxyContract.version()).to.equal("positive");
        }
        expect(await logicProxyContract.getNumber()).to.equal(initialValue);
        expect(await positiveImplemContract.getNumber()).to.equal(initialValuePositiveImplem);
        expect(await negativeImplemContract.getNumber()).to.equal(initialValueNegativeImplem);

        // Modify and check the result
        await (await logicProxyContract.modify()).wait();
        // Now the version should be the opposite from the initial
        if (initialVersion == "positive") {
          expect(await logicProxyContract.getNumber()).to.equal(initialValue - 1n);
          expect(await negativeImplemContract.getNumber()).to.equal(initialValueNegativeImplem);
        }
        else {
          expect(await logicProxyContract.getNumber()).to.equal(initialValue + 1n);
          expect(await positiveImplemContract.getNumber()).to.equal(initialValuePositiveImplem);
        }
      }).timeout(1000000);
    });
  });
}