import { deployments, network } from "hardhat";
import { expect } from "chai";
import { BasicStorage, Chatterbox } from "../../typechain-types";
import { developmentChains } from "../../helper-hardhat-config";

const setup = deployments.createFixture(async ({deployments, getNamedAccounts, ethers}, options) => {
  if (developmentChains.includes(network.name))
    await deployments.fixture(); // ensure you start from a fresh deployments
  const { deployer } = await getNamedAccounts();
  const basicStorage = await ethers.getContract('BasicStorage', deployer) as BasicStorage;
  const chatterbox = await ethers.getContract('Chatterbox', deployer) as Chatterbox;

  return { deployer, basicStorage, chatterbox };
});

describe('Chatterbox & BasicStorage', () => {
  describe("Message calls", function () {
    it("Should add number", async function () {
      const { basicStorage, chatterbox } = await setup();
      const AMOUNT_TO_ADD = 10n;
      const initialNumber = await basicStorage.number();
      await (await chatterbox.addToTarget(AMOUNT_TO_ADD)).wait();
      const afterNumber = await basicStorage.number();
      expect(afterNumber).to.equal(initialNumber + AMOUNT_TO_ADD);
    });
    it("Should substract number", async function () {
      const { basicStorage, chatterbox } = await setup();
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
      const { basicStorage, chatterbox } = await setup();
      const AMOUNT_TO_MULTIPLY_BY = 3n;
      const initialNumber = await basicStorage.number();
      await (await chatterbox.multiplyToTarget(AMOUNT_TO_MULTIPLY_BY)).wait();
      const afterNumber = await basicStorage.number();
      expect(afterNumber).to.equal(initialNumber * AMOUNT_TO_MULTIPLY_BY);
    });
    it("Should divide number", async function () {
      const { basicStorage, chatterbox } = await setup();
      const AMOUNT_TO_DIVIDE_BY = 2n; // do not use 0
      const initialNumber = await basicStorage.number();
      await (await chatterbox.divideToTarget(AMOUNT_TO_DIVIDE_BY)).wait();
      const afterNumber = await basicStorage.number();
      expect(afterNumber).to.equal(initialNumber / AMOUNT_TO_DIVIDE_BY);
    });
  });
});

