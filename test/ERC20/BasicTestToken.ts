import {
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { BasicTestToken } from "../../typechain-types";
import { developmentChains, basicTestTokenAddresses } from "../../helper-hardhat-config";
import { signERC2612Permit } from "eth-permit";

if (developmentChains.includes(network.name)) {
  // ------------ Local execution testing ------------
  describe("BasicTestToken (local)", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployFixture() {
      // Contracts are deployed using the first signer/account by default
      const [owner, secondAccount] = await ethers.getSigners();

      const BasicTestToken = await ethers.getContractFactory("BasicTestToken");
      const basicTestToken = await BasicTestToken.deploy(owner.address);

      const INITIAL_OWNER_TOKENS = 10;
      await basicTestToken.mint(owner.address, INITIAL_OWNER_TOKENS);

      return { owner, secondAccount, basicTestToken, INITIAL_OWNER_TOKENS };
    }

    describe("Deployment", function () {
      it("Should set the right initial owner", async function () {
        const { owner, basicTestToken } = await loadFixture(deployFixture);

        expect(await basicTestToken.owner()).to.equal(owner.address);
      });
    });

    describe("Mint", function () {
      it("Should let the owner mint", async function () {
        const { owner, basicTestToken } = await loadFixture(deployFixture);
        const AMOUNT_TO_MINT = 10n;
        
        const initialBalance = await basicTestToken.balanceOf(owner.address);
        await basicTestToken.mint(owner.address, AMOUNT_TO_MINT);
        const afterMintBalance = await basicTestToken.balanceOf(owner.address);
        expect(afterMintBalance).to.equal(initialBalance + AMOUNT_TO_MINT);
      });

      it("Should revert something if other than owner try to mint", async function () {
        const { secondAccount, basicTestToken } = await loadFixture(deployFixture);
        const AMOUNT_TO_MINT = 10n;

        
        await expect(basicTestToken.connect(secondAccount).mint(secondAccount.address, AMOUNT_TO_MINT)).to.be.revertedWithCustomError(basicTestToken, `OwnableUnauthorizedAccount`);
      });

      it("Should emit an event after minting", async function () {
        const { owner, basicTestToken } = await loadFixture(deployFixture);
        const AMOUNT_TO_MINT = 10n;
        const receiver = owner.address;

        const receipt = await (await basicTestToken.mint(receiver, AMOUNT_TO_MINT)).wait();
        const events = await basicTestToken.queryFilter(basicTestToken.filters.Transfer, receipt?.blockNumber, receipt?.blockNumber); // mint is a transfer event
        const firstTransfer = events[0];

        expect(firstTransfer.args[0]).to.equal("0x0000000000000000000000000000000000000000"); // origin of mint is address 0x0
        expect(firstTransfer.args[1]).to.equal(receiver);
        expect(firstTransfer.args[2]).to.equal(AMOUNT_TO_MINT);
      });
    });
    describe("Permit", function () {
      it("Should allow user to permit a transfer", async function() {
        const { owner, secondAccount, basicTestToken, INITIAL_OWNER_TOKENS } = await loadFixture(deployFixture);
        const basicTestTokenSecondUser = basicTestToken.connect(secondAccount);

        const { r, s, v } = await signERC2612Permit(owner, await basicTestToken.getAddress(), owner.address, secondAccount.address, ethers.MaxUint256.toString());

        await basicTestTokenSecondUser.permit(owner.address, secondAccount.address, ethers.MaxUint256.toString(), ethers.MaxUint256.toString(), v, r, s);
        await basicTestTokenSecondUser.transferFrom(owner.address, secondAccount.address, INITIAL_OWNER_TOKENS);
        expect(await basicTestToken.balanceOf(secondAccount.address)).to.equal(INITIAL_OWNER_TOKENS);
      });
    });
  });

} else {
  // ------------ Live execution testing ------------
  describe("BasicTestToken (live)", function () {
    let basicTestToken: BasicTestToken;
    let owner: any;
    let secondAccount: any;
    let isSecondAccountRandom: boolean;
    const INITIAL_OWNER_TOKENS = 10n * 10n ** 18n;

    // Can't use fixture outside of local execution
    before(async () => {
      // Users part
      [owner, secondAccount] = await ethers.getSigners();
      if (secondAccount == undefined || secondAccount == "") {
        secondAccount = ethers.Wallet.createRandom().connect(ethers.provider);
        isSecondAccountRandom = true;
      }

      // Retrieve the contract address from the helper-hardhat-config.ts file and instantiate the contract
      const contractAddress = basicTestTokenAddresses[network.name];
      if (contractAddress == undefined || contractAddress == "") {
        console.error(`Contract address invalid: ${contractAddress}`);
        // revert the execution
        throw new Error('Invalid contract address');
      }
      basicTestToken = await ethers.getContractAt("BasicTestToken", contractAddress, owner);

      // check if enough token
      const initalToken = await basicTestToken.balanceOf(owner.address);
      console.log("initial owner tokens: ", initalToken);
      if (initalToken < INITIAL_OWNER_TOKENS) {
        await (await basicTestToken.mint(owner.address, INITIAL_OWNER_TOKENS)).wait();
      }

      // send random user some eth so he can perform transactions
      if (isSecondAccountRandom) {
        console.log("random user balance: ", await ethers.provider.getBalance(secondAccount.address));
        await (await owner.sendTransaction({to: secondAccount.address, value: ethers.parseEther("1.0")})).wait();
        console.log("random user balance: ", await ethers.provider.getBalance(secondAccount.address));
      }
    });

    describe("Mint on testnet", function () {
      it("Should mint tokens and emit an event", async function () {
        const AMOUNT_TO_MINT = 10n;
        const receiver = owner.address;

        const initialBalance = await basicTestToken.balanceOf(owner.address);
        const receipt = await (await basicTestToken.mint(receiver, AMOUNT_TO_MINT)).wait();
        const afterMintBalance = await basicTestToken.balanceOf(owner.address);
        const events = await basicTestToken.queryFilter(basicTestToken.filters.Transfer, receipt?.blockNumber, receipt?.blockNumber); // mint is a transfer event
        const firstTransfer = events[0];

        expect(afterMintBalance).to.equal(initialBalance + AMOUNT_TO_MINT);
        expect(firstTransfer.args[0]).to.equal("0x0000000000000000000000000000000000000000"); // origin of mint is address 0x0
        expect(firstTransfer.args[1]).to.equal(receiver);
        expect(firstTransfer.args[2]).to.equal(AMOUNT_TO_MINT);
      });
      it("Should revert something if other than owner try to mint", async function () {
        const AMOUNT_TO_MINT = 10n;

        try {
          await (await basicTestToken.connect(secondAccount).mint(secondAccount.address, AMOUNT_TO_MINT)).wait();
          throw new Error('Should have revert');
        } catch (error: any) {
          if (error.data && basicTestToken) {
            const decodedError = basicTestToken.interface.parseError(error.data);
            console.log("transaction failed name: ", decodedError?.name);
            console.log("transaction failed args: ", decodedError?.args);
            expect(decodedError?.name).to.equal("OwnableUnauthorizedAccount"); // can I access custom error properly ?
            expect(decodedError?.args[0]).to.equal(secondAccount.address);
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
      });
    });

    describe("Burn on testnet", function () {
      it("Should burn tokens and emit an event", async function () {
        const AMOUNT_TO_BURN = 1n;

        const initialBalance = await basicTestToken.balanceOf(owner.address);
        if (initialBalance < AMOUNT_TO_BURN) {
          console.log("TEST NOT RUN: mint token before running burn test");
          throw new Error("Not enough tokens for burn test");
        }
        const receipt = await (await basicTestToken.burn(AMOUNT_TO_BURN)).wait();
        const afterBurnBalance = await basicTestToken.balanceOf(owner.address);
        const events = await basicTestToken.queryFilter(basicTestToken.filters.Transfer, receipt?.blockNumber, receipt?.blockNumber); // burn is a transfer event
        const firstTransfer = events[0];

        expect(afterBurnBalance).to.equal(initialBalance - AMOUNT_TO_BURN);
        expect(firstTransfer.args[0]).to.equal(owner.address);
        expect(firstTransfer.args[1]).to.equal("0x0000000000000000000000000000000000000000"); // receiver of burn is address 0x0
        expect(firstTransfer.args[2]).to.equal(AMOUNT_TO_BURN);
      });
      it("Should revert something if someone burn without tokens", async function () {
        const AMOUNT_TO_MINT = 10n;

        try {
          await (await basicTestToken.connect(secondAccount).mint(secondAccount.address, AMOUNT_TO_MINT)).wait();
          throw new Error('Should have revert');
        } catch (error: any) {
          if (error.data && basicTestToken) {
            const decodedError = basicTestToken.interface.parseError(error.data);
            console.log("transaction failed name: ", decodedError?.name);
            console.log("transaction failed args: ", decodedError?.args);
            expect(decodedError?.name).to.equal("OwnableUnauthorizedAccount"); // can I access custom error properly ?
            expect(decodedError?.args[0]).to.equal(secondAccount.address);
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
      });
    });

    describe("Permit on testnet", function () {
      it("Should allow user to permit a transfer", async () => {
        const basicTestTokenSecondUser = basicTestToken.connect(secondAccount);
        const { r, s, v } = await signERC2612Permit(owner, await basicTestToken.getAddress(), owner.address, secondAccount.address, ethers.MaxUint256.toString());
        const initialTokenAmountSecondUser = await basicTestToken.balanceOf(secondAccount.address);
        // console.log("initial second user balance: ", initialTokenAmountSecondUser);
        // add permission
        await (await basicTestTokenSecondUser.permit(owner.address, secondAccount.address, ethers.MaxUint256.toString(), ethers.MaxUint256.toString(), v, r, s)).wait();
        // console.log("permited");
        await (await basicTestTokenSecondUser.transferFrom(owner.address, secondAccount.address, INITIAL_OWNER_TOKENS)).wait();
        // console.log("transfered");
        const newAmount = await basicTestToken.balanceOf(secondAccount.address);
        // console.log("new token amount: ", newAmount);
        expect(newAmount).to.equal(INITIAL_OWNER_TOKENS + initialTokenAmountSecondUser);

        // remove permission after test
        // console.log("before remove allowance");
        await (await basicTestToken.approve(secondAccount.address, 0)).wait();
        // console.log("removed permit");
        expect(await basicTestToken.allowance(owner.address, secondAccount.address)).to.equal(0n);
      }).timeout(1000000);
    });
    after(async () => {
      // send back all non used eth to the owner if not owned second account.
      if (isSecondAccountRandom) {
        const remainedEth = await ethers.provider.getBalance(secondAccount.address) - ethers.parseEther("0.1");
        console.log("random user balance: ", remainedEth);
        if (remainedEth > 0n) {
          await (await secondAccount.sendTransaction({to: owner.address, value: remainedEth})).wait();
          console.log("random user balance: ", await ethers.provider.getBalance(secondAccount.address));
        }
      }
    });
  });
}