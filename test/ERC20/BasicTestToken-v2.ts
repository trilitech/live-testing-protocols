import { deployments, ethers, network } from "hardhat";
import { expect } from "chai";
import { BasicTestToken } from "../../typechain-types";
import { developmentChains } from "../../helper-hardhat-config";
import { signERC2612Permit } from "eth-permit";

const setup = deployments.createFixture(async ({deployments, getNamedAccounts, ethers}, options) => {
  if (developmentChains.includes(network.name))
    await deployments.fixture(); // ensure you start from a fresh deployments
  const { deployer, assistant } = await getNamedAccounts();
  if (!assistant)
    throw new Error("Error: You should add a second user if you want to test BasicTestToken");
  const basicTestTokenDeployer = await ethers.getContract('BasicTestToken', deployer) as BasicTestToken;
  const basicTestTokenAssistant = await ethers.getContract('BasicTestToken', assistant) as BasicTestToken;
  const INITIAL_OWNER_TOKENS = 10n * 10n ** 18n;

  // check if enough token
  const initalToken = await basicTestTokenDeployer.balanceOf(deployer);
  console.log("initial owner tokens: ", initalToken);
  if (initalToken < INITIAL_OWNER_TOKENS) {
    await (await basicTestTokenDeployer.mint(deployer, INITIAL_OWNER_TOKENS)).wait();
  }
  return { deployer, assistant, basicTestTokenDeployer, basicTestTokenAssistant, INITIAL_OWNER_TOKENS };
});

describe('BasicTestToken', () => {
  describe("Mint", function () {
    it("Should mint tokens and emit an event", async function () {
      const { deployer, basicTestTokenDeployer } = await setup();
      const AMOUNT_TO_MINT = 10n;
      const receiver = deployer;

      const initialBalance = await basicTestTokenDeployer.balanceOf(deployer);
      const receipt = await (await basicTestTokenDeployer.mint(receiver, AMOUNT_TO_MINT)).wait();
      const afterMintBalance = await basicTestTokenDeployer.balanceOf(deployer);
      const events = await basicTestTokenDeployer.queryFilter(basicTestTokenDeployer.filters.Transfer, receipt?.blockNumber, receipt?.blockNumber); // mint is a transfer event
      const firstTransfer = events[0];

      expect(afterMintBalance).to.equal(initialBalance + AMOUNT_TO_MINT);
      expect(firstTransfer.args[0]).to.equal("0x0000000000000000000000000000000000000000"); // origin of mint is address 0x0
      expect(firstTransfer.args[1]).to.equal(receiver);
      expect(firstTransfer.args[2]).to.equal(AMOUNT_TO_MINT);
    }).timeout(1000000);
    it("Should revert something if other than owner try to mint", async function () {
      const { assistant, basicTestTokenDeployer, basicTestTokenAssistant } = await setup();
      const AMOUNT_TO_MINT = 10n;

      try {
        await (await basicTestTokenAssistant.mint(assistant, AMOUNT_TO_MINT)).wait();
        throw new Error('Should have revert');
      } catch (error: any) {
        if (error.data && basicTestTokenDeployer) {
          const decodedError = basicTestTokenDeployer.interface.parseError(error.data);
          console.log("transaction failed name: ", decodedError?.name);
          console.log("transaction failed args: ", decodedError?.args);
          expect(decodedError?.name).to.equal("OwnableUnauthorizedAccount"); // can I access custom error properly ?
          expect(decodedError?.args[0]).to.equal(assistant);
        } else {
          // /!\ TMP IF STATEMENT /!\
          // this is actually added bc etherlink doesn't support correctly the returned data when transaction revert
          if (network.name == "etherlink" || network.name == "nightly") {
            console.log("ERROR TO HANDLE FOR CORE TEAM.");
            return;
          }
          console.log(`ERROR RECEIVED:\n ${error}\n`);
          throw new Error('Invalid error format, see log above');
        }
      }
    }).timeout(1000000);
  });

  describe("Burn", function () {
    it("Should burn tokens and emit an event", async function () {
      const { deployer, basicTestTokenDeployer } = await setup();
      const AMOUNT_TO_BURN = 1n;

      const initialBalance = await basicTestTokenDeployer.balanceOf(deployer);
      if (initialBalance < AMOUNT_TO_BURN) {
        console.log("TEST NOT RUN: mint token before running burn test");
        throw new Error("Not enough tokens for burn test");
      }
      const receipt = await (await basicTestTokenDeployer.burn(AMOUNT_TO_BURN)).wait();
      const afterBurnBalance = await basicTestTokenDeployer.balanceOf(deployer);
      const events = await basicTestTokenDeployer.queryFilter(basicTestTokenDeployer.filters.Transfer, receipt?.blockNumber, receipt?.blockNumber); // burn is a transfer event
      const firstTransfer = events[0];

      expect(afterBurnBalance).to.equal(initialBalance - AMOUNT_TO_BURN);
      expect(firstTransfer.args[0]).to.equal(deployer);
      expect(firstTransfer.args[1]).to.equal("0x0000000000000000000000000000000000000000"); // receiver of burn is address 0x0
      expect(firstTransfer.args[2]).to.equal(AMOUNT_TO_BURN);
    }).timeout(1000000);
    it("Should revert something if someone burn without tokens", async function () {
      const { assistant, basicTestTokenDeployer, basicTestTokenAssistant } = await setup();
      const AMOUNT_TO_MINT = 10n;

      try {
        await (await basicTestTokenAssistant.mint(assistant, AMOUNT_TO_MINT)).wait();
        throw new Error('Should have revert');
      } catch (error: any) {
        if (error.data && basicTestTokenDeployer) {
          const decodedError = basicTestTokenDeployer.interface.parseError(error.data);
          console.log("transaction failed name: ", decodedError?.name);
          console.log("transaction failed args: ", decodedError?.args);
          expect(decodedError?.name).to.equal("OwnableUnauthorizedAccount"); // can I access custom error properly ?
          expect(decodedError?.args[0]).to.equal(assistant);
        } else {
          // /!\ TMP IF STATEMENT /!\
          // this is actually added bc etherlink doesn't support correctly the returned data when transaction revert
          if (network.name == "etherlink" || network.name == "nightly") {
            console.log("ERROR TO HANDLE FOR CORE TEAM.");
            return;
          }
          console.log(`ERROR RECEIVED:\n ${error}\n`);
          throw new Error('Invalid error format, see log above');
        }
      }
    }).timeout(1000000);
  });

  describe("Permit", function () {
    it("Should allow user to permit a transfer", async () => {
      const { deployer, assistant, basicTestTokenDeployer, basicTestTokenAssistant, INITIAL_OWNER_TOKENS } = await setup();
      const [ owner ] = await ethers.getSigners(); // ethers equivalent to deployer
      const { r, s, v } = await signERC2612Permit(owner, await basicTestTokenDeployer.getAddress(), deployer, assistant, ethers.MaxUint256.toString());
      const initialTokenAmountSecondUser = await basicTestTokenDeployer.balanceOf(assistant);
      // console.log("initial second user balance: ", initialTokenAmountSecondUser);
      // add permission
      await (await basicTestTokenAssistant.permit(deployer, assistant, ethers.MaxUint256.toString(), ethers.MaxUint256.toString(), v, r, s)).wait();
      // console.log("permited");
      await (await basicTestTokenAssistant.transferFrom(deployer, assistant, INITIAL_OWNER_TOKENS)).wait();
      // console.log("transfered");
      const newAmount = await basicTestTokenDeployer.balanceOf(assistant);
      // console.log("new token amount: ", newAmount);
      expect(newAmount).to.equal(INITIAL_OWNER_TOKENS + initialTokenAmountSecondUser);

      // remove permission after test
      // console.log("before remove allowance");
      await (await basicTestTokenDeployer.approve(assistant, 0)).wait();
      // console.log("removed permit");
      expect(await basicTestTokenDeployer.allowance(deployer, assistant)).to.equal(0n);
    }).timeout(1000000);
  });
});

