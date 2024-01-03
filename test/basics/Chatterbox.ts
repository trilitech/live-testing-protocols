import {
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { BasicStorage, BasicTestToken, Chatterbox } from "../../typechain-types";
import { developmentChains, basicTestTokenAddresses, basicStorageAddresses, chatterboxAddresses } from "../../helper-hardhat-config";

if (developmentChains.includes(network.name)) {
  // ------------ Local execution testing ------------
  describe("Chatterbox & BasicStorage (local)", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployFixture() {
      // Contracts are deployed using the first signer/account by default
      const [owner, secondAccount] = await ethers.getSigners();

      const BasicStorage = await ethers.getContractFactory("BasicStorage");
      const basicStorage = await BasicStorage.deploy();

      const Chatterbox = await ethers.getContractFactory("Chatterbox");
      const chatterbox = await Chatterbox.deploy(await basicStorage.getAddress());

      return { owner, secondAccount, basicStorage, chatterbox };
    }

    describe("Deployment", function () {
      it("Should set the right target", async function () {
        const { basicStorage, chatterbox } = await loadFixture(deployFixture);

        expect(await chatterbox.basicStorage()).to.equal(await basicStorage.getAddress());
      });
    });

    describe("Message calls", function () {
      it("Should add number", async function () {
        const { basicStorage, chatterbox } = await loadFixture(deployFixture);
        const AMOUNT_TO_ADD = 10n;

        const initialNumber = await basicStorage.number();
        await chatterbox.addToTarget(AMOUNT_TO_ADD);
        const afterNumber = await basicStorage.number();
        expect(afterNumber).to.equal(initialNumber + AMOUNT_TO_ADD);
      });
      it("Should substract number", async function () {
        const { basicStorage, chatterbox } = await loadFixture(deployFixture);
        const AMOUNT_TO_SUBSTRACT = 2n;

        let initialNumber = await basicStorage.number();
        // using uint so adding data first to not revert with underflow
        if (initialNumber < AMOUNT_TO_SUBSTRACT) {
          await chatterbox.addToTarget(AMOUNT_TO_SUBSTRACT + 1n);
          initialNumber = await basicStorage.number();
        }
        await chatterbox.substractToTarget(AMOUNT_TO_SUBSTRACT);
        const afterNumber = await basicStorage.number();
        expect(afterNumber).to.equal(initialNumber - AMOUNT_TO_SUBSTRACT);
      });
      it("Should multiply number", async function () {
        const { basicStorage, chatterbox } = await loadFixture(deployFixture);
        const AMOUNT_TO_MULTIPLY_BY = 3n;

        const initialNumber = await basicStorage.number();
        await chatterbox.multiplyToTarget(AMOUNT_TO_MULTIPLY_BY);
        const afterNumber = await basicStorage.number();
        expect(afterNumber).to.equal(initialNumber * AMOUNT_TO_MULTIPLY_BY);
      });
      it("Should divide number", async function () {
        const { basicStorage, chatterbox } = await loadFixture(deployFixture);
        const AMOUNT_TO_DIVIDE_BY = 2n; // do not use 0

        const initialNumber = await basicStorage.number();
        await chatterbox.divideToTarget(AMOUNT_TO_DIVIDE_BY);
        const afterNumber = await basicStorage.number();
        expect(afterNumber).to.equal(initialNumber / AMOUNT_TO_DIVIDE_BY);
      });
    });
  });

} else {
  // ------------ Live execution testing ------------
  describe("Chatterbox & BasicStorage (live)", function () {
    let basicStorage: BasicStorage;
    let chatterbox: Chatterbox;
    let owner: any;

    // Can't use fixture outside of local execution
    before(async () => {
      // Users part
      [ owner ] = await ethers.getSigners();

      // Retrieve the contract address from the helper-hardhat-config.ts file and instantiate the contract
      const basicStorageAddress = basicStorageAddresses[network.name];
      const chatterboxAddress = chatterboxAddresses[network.name];
      if (basicStorageAddress == undefined || basicStorageAddress == "" || chatterboxAddress == undefined || chatterboxAddress == "") {
        console.error("Contract address invalid.");
        // revert the execution
        throw new Error('Invalid contract address');
      }
      basicStorage = await ethers.getContractAt("BasicStorage", basicStorageAddress, owner);
      chatterbox = await ethers.getContractAt("Chatterbox", chatterboxAddress, owner);

      // Check if target is set correctly
      const actualTarget = await chatterbox.basicStorage();
      if (actualTarget != basicStorageAddress) {
        console.log("Setup the good target...");
        await (await chatterbox.setTarget(basicStorageAddress)).wait();
      }

    });

    describe("Message calls", function () {
      it("Should add number", async function () {
        const AMOUNT_TO_ADD = 10n;
        const initialNumber = await basicStorage.number();
        await (await chatterbox.addToTarget(AMOUNT_TO_ADD)).wait();
        const afterNumber = await basicStorage.number();
        expect(afterNumber).to.equal(initialNumber + AMOUNT_TO_ADD);
      });
      it("Should substract number", async function () {
        const AMOUNT_TO_SUBSTRACT = 2n;
        let initialNumber = await basicStorage.number();
        // using uint so adding data first to not revert with underflow
        if (initialNumber < AMOUNT_TO_SUBSTRACT) {
          await (await chatterbox.addToTarget(AMOUNT_TO_SUBSTRACT + 1n)).wait();
          initialNumber = await basicStorage.number();
        }
        await (await chatterbox.substractToTarget(AMOUNT_TO_SUBSTRACT)).wait();
        const afterNumber = await basicStorage.number();
        expect(afterNumber).to.equal(initialNumber - AMOUNT_TO_SUBSTRACT);
      });
      it("Should multiply number", async function () {
        const AMOUNT_TO_MULTIPLY_BY = 3n;
        const initialNumber = await basicStorage.number();
        await (await chatterbox.multiplyToTarget(AMOUNT_TO_MULTIPLY_BY)).wait();
        const afterNumber = await basicStorage.number();
        expect(afterNumber).to.equal(initialNumber * AMOUNT_TO_MULTIPLY_BY);
      });
      it("Should divide number", async function () {
        const AMOUNT_TO_DIVIDE_BY = 2n; // do not use 0
        const initialNumber = await basicStorage.number();
        await (await chatterbox.divideToTarget(AMOUNT_TO_DIVIDE_BY)).wait();
        const afterNumber = await basicStorage.number();
        expect(afterNumber).to.equal(initialNumber / AMOUNT_TO_DIVIDE_BY);
      });
    });
  });
}