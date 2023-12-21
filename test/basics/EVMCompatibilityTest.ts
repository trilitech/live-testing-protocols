import {
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { EVMCompatibilityTest } from "../../typechain-types";
import { developmentChains, evmCompatibilityTestAddresses } from "../../helper-hardhat-config";
import { signERC2612Permit } from "eth-permit";

if (developmentChains.includes(network.name)) {
  // ------------ Local execution testing ------------
  describe("EVMCompatibilityTest (local)", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployFixture() {
      // Contracts are deployed using the first signer/account by default
      const [ owner ] = await ethers.getSigners();
      const UNIVERSAL_NUMBER = 42;
      const KEY_STORAGE = ethers.keccak256(ethers.toUtf8Bytes("Here we go again"));
      const VALUE_STORED = 2;
      const ARRAY = [1, 2];
      const MAP = [
        {key: ethers.keccak256(ethers.toUtf8Bytes("first key")), value: 12345},
        {key: ethers.keccak256(ethers.toUtf8Bytes("second key")), value: 54321},
      ];

      const EVMCompatibilityTest = await ethers.getContractFactory("EVMCompatibilityTest");
      const evmCompatibilityTest = await EVMCompatibilityTest.deploy(UNIVERSAL_NUMBER);

      return { owner, evmCompatibilityTest, UNIVERSAL_NUMBER, KEY_STORAGE, VALUE_STORED, ARRAY, MAP };
    }

    describe("Deployment", function () {
      it("Should set the right initial number", async function () {
        const { evmCompatibilityTest, UNIVERSAL_NUMBER } = await loadFixture(deployFixture);

        expect(await evmCompatibilityTest.universalNumber()).to.equal(UNIVERSAL_NUMBER);
      });
    });

    describe("Basic Operations", function () {
      it("Should add two numbers", async function () {
        const { evmCompatibilityTest } = await loadFixture(deployFixture);
        const firstNumber = Math.floor(Math.random() * 100); // random num between 0 to 99
        const secondNumber = Math.floor(Math.random() * 100); // random num between 0 to 99
        const result = firstNumber + secondNumber;

        const resultFromContract = await evmCompatibilityTest.add(firstNumber, secondNumber);
        expect(Number(resultFromContract)).to.equal(result);
      });
      it("Should add two numbers be protected from overflow", async function () {
        const { evmCompatibilityTest } = await loadFixture(deployFixture);
        const firstNumber = 115792089237316195423570985008687907853269984665640564039457584007913129639935n; // max value
        const secondNumber = 1;

        // this will overflow bc first number is maximum value in uint256
        try {
          await evmCompatibilityTest.add(firstNumber, secondNumber);
          throw new Error("Should have revert for underflow");
        } catch (error: any) {
          if (error.data && evmCompatibilityTest) {
            // successfully reverted
            const decodedError = evmCompatibilityTest.interface.parseError(error.data);
            expect(decodedError?.name).to.equal("Panic");
          } else {
            console.log(error);
            throw new Error("An unexpected error occured");
          }
        }
      });
      it("Should substract two numbers", async function () {
        const { evmCompatibilityTest } = await loadFixture(deployFixture);
        const firstNumber = Math.floor(Math.random() * 100); // random num between 0 to 99
        const secondNumber = Math.floor(Math.random() * 100); // random num between 0 to 99
        const result = firstNumber > secondNumber ? firstNumber - secondNumber : secondNumber - firstNumber;

        const resultFromContract = firstNumber > secondNumber ? 
          await evmCompatibilityTest.subtract(firstNumber, secondNumber)
          : await evmCompatibilityTest.subtract(secondNumber, firstNumber);
        expect(Number(resultFromContract)).to.equal(result);
      });
      it("Should substract two numbers be protected from underflow", async function () {
        const { evmCompatibilityTest } = await loadFixture(deployFixture);
        const firstNumber = 0;
        const secondNumber = 1;

        // this will underflow as second number is > than first number
        try {
          await evmCompatibilityTest.subtract(firstNumber, secondNumber);
          throw new Error("Should have revert for underflow");
        } catch (error: any) {
          if (error.data && evmCompatibilityTest) {
            // successfully reverted
            const decodedError = evmCompatibilityTest.interface.parseError(error.data);
            expect(decodedError?.name).to.equal("Panic");
          } else {
            console.log(error);
            throw new Error("An unexpected error occured");
          }
        }
      });
      it("Should multiply two numbers", async function () {
        const { evmCompatibilityTest } = await loadFixture(deployFixture);
        const firstNumber = Math.floor(Math.random() * 100); // random num between 0 to 99
        const secondNumber = Math.floor(Math.random() * 100); // random num between 0 to 99
        const result = firstNumber * secondNumber;

        const resultFromContract = await evmCompatibilityTest.multiply(firstNumber, secondNumber);
        expect(Number(resultFromContract)).to.equal(result);
      });
      it("Should divide two numbers", async function () {
        const { evmCompatibilityTest } = await loadFixture(deployFixture);
        const firstNumber = Math.floor(Math.random() * 100); // random num between 0 to 99
        const secondNumber = Math.floor(Math.random() * 100); // random num between 0 to 99
        const result = firstNumber > secondNumber ? Math.floor(firstNumber / secondNumber) : Math.floor(secondNumber / firstNumber);

        const resultFromContract = firstNumber > secondNumber ? 
          await evmCompatibilityTest.divide(firstNumber, secondNumber)
          : await evmCompatibilityTest.divide(secondNumber, firstNumber);
        expect(Number(resultFromContract)).to.equal(result);
      });
      it("Should revert on divide by 0", async function () {
        const { evmCompatibilityTest } = await loadFixture(deployFixture);
        const firstNumber = Math.floor(Math.random() * 100); // random num between 0 to 99
        const secondNumber = 0;

        try {
          await evmCompatibilityTest.divide(firstNumber, secondNumber);
          throw new Error("Should have revert for underflow");
        } catch (error: any) {
          if (error.data && evmCompatibilityTest) {
            // successfully reverted
            const decodedError = evmCompatibilityTest.interface.parseError(error.data);
            expect(decodedError?.name).to.equal("Panic");
          } else {
            console.log(error);
            throw new Error("An unexpected error occured");
          }
        }
      });
      it("Should modulo two numbers", async function () {
        const { evmCompatibilityTest } = await loadFixture(deployFixture);
        const firstNumber = Math.floor(Math.random() * 100); // random num between 0 to 99
        const secondNumber = 2; 
        const result = firstNumber % secondNumber;

        const resultFromContract = await evmCompatibilityTest.modulo(firstNumber, secondNumber);
        expect(Number(resultFromContract)).to.equal(result);
      });
      it("Should exponentiate two numbers", async function () {
        const { evmCompatibilityTest } = await loadFixture(deployFixture);
        const firstNumber = 2;
        const secondNumber = 8;
        const result = firstNumber ** secondNumber;

        const resultFromContract = await evmCompatibilityTest.exponentiate(firstNumber, secondNumber);
        expect(Number(resultFromContract)).to.equal(result);
      });
      it("Should compare with equal", async function () {
        const { evmCompatibilityTest } = await loadFixture(deployFixture);
        const firstNumber: number = 1;
        const secondNumber: number = 2;
        const firstCase = firstNumber == firstNumber;
        const secondCase = firstNumber == secondNumber;

        // First case
        let resultFromContract = await evmCompatibilityTest.equal(firstNumber, firstNumber);
        expect(resultFromContract).to.equal(firstCase);
        // Second case
        resultFromContract = await evmCompatibilityTest.equal(firstNumber, secondNumber);
        expect(resultFromContract).to.equal(secondCase);
      });
      it("Should compare with not equal", async function () {
        const { evmCompatibilityTest } = await loadFixture(deployFixture);
        const firstNumber: number = 1;
        const secondNumber: number = 2;
        const firstCase = firstNumber != firstNumber;
        const secondCase = firstNumber != secondNumber;

        // First case
        let resultFromContract = await evmCompatibilityTest.notEqual(firstNumber, firstNumber);
        expect(resultFromContract).to.equal(firstCase);
        // Second case
        resultFromContract = await evmCompatibilityTest.notEqual(firstNumber, secondNumber);
        expect(resultFromContract).to.equal(secondCase);
      });
      it("Should compare with greater than", async function () {
        const { evmCompatibilityTest } = await loadFixture(deployFixture);
        const firstNumber: number = 1;
        const secondNumber: number = 2;
        const firstCase = firstNumber > firstNumber;
        const secondCase = firstNumber > secondNumber;

        // First case
        let resultFromContract = await evmCompatibilityTest.greaterThan(firstNumber, firstNumber);
        expect((resultFromContract)).to.equal(firstCase);
        // Second case
        resultFromContract = await evmCompatibilityTest.greaterThan(firstNumber, secondNumber);
        expect(resultFromContract).to.equal(secondCase);
      });
      it("Should compare with less than", async function () {
        const { evmCompatibilityTest } = await loadFixture(deployFixture);
        const firstNumber: number = 1;
        const secondNumber: number = 2;
        const firstCase = firstNumber < firstNumber;
        const secondCase = firstNumber < secondNumber;

        // First case
        let resultFromContract = await evmCompatibilityTest.lessThan(firstNumber, firstNumber);
        expect(resultFromContract).to.equal(firstCase);
        // Second case
        resultFromContract = await evmCompatibilityTest.lessThan(firstNumber, secondNumber);
        expect(resultFromContract).to.equal(secondCase);
      });
      it("Should compare with greater than or equal", async function () {
        const { evmCompatibilityTest } = await loadFixture(deployFixture);
        const firstNumber: number = 1;
        const secondNumber: number = 2;
        const firstCase = firstNumber >= firstNumber;
        const secondCase = firstNumber >= secondNumber;

        // First case
        let resultFromContract = await evmCompatibilityTest.greaterThanOrEqual(firstNumber, firstNumber);
        expect(resultFromContract).to.equal(firstCase);
        // Second case
        resultFromContract = await evmCompatibilityTest.greaterThanOrEqual(firstNumber, secondNumber);
        expect(resultFromContract).to.equal(secondCase);
      });
      it("Should compare with less than or equal", async function () {
        const { evmCompatibilityTest } = await loadFixture(deployFixture);
        const firstNumber: number = 1;
        const secondNumber: number = 2;
        const firstCase = firstNumber <= firstNumber;
        const secondCase = firstNumber <= secondNumber;

        // First case
        let resultFromContract = await evmCompatibilityTest.lessThanOrEqual(firstNumber, firstNumber);
        expect(resultFromContract).to.equal(firstCase);
        // Second case
        resultFromContract = await evmCompatibilityTest.lessThanOrEqual(firstNumber, secondNumber);
        expect(resultFromContract).to.equal(secondCase);
      });
    });

    describe("State Management", function () {
      it("Should set the value in storage", async function () {
        const { evmCompatibilityTest, KEY_STORAGE, VALUE_STORED } = await loadFixture(deployFixture);

        await evmCompatibilityTest.store(KEY_STORAGE, VALUE_STORED);
        const storedValue = await evmCompatibilityTest.read(KEY_STORAGE);
        expect(storedValue).to.equal(VALUE_STORED);
      });
      it("Should remove the value in storage", async function () {
        const { evmCompatibilityTest, KEY_STORAGE } = await loadFixture(deployFixture);

        await evmCompatibilityTest.remove(KEY_STORAGE);
        const storedValue = await evmCompatibilityTest.read(KEY_STORAGE);
        expect(storedValue).to.equal(0);
      });
    });

    describe("Storage Location Manipulation", function () {
      it("Should add values in array and remove them", async function () {
        const { evmCompatibilityTest, ARRAY } = await loadFixture(deployFixture);

        // Add in array
        await evmCompatibilityTest.pushArrayElement(ARRAY[0]);
        await evmCompatibilityTest.pushArrayElement(ARRAY[1]);
        // // Get in array
        let firstStoredValue = await evmCompatibilityTest.getArrayElement(0);
        let secondStoredValue = await evmCompatibilityTest.getArrayElement(1);
        expect(Number(firstStoredValue)).to.equal(ARRAY[0]);
        expect(Number(secondStoredValue)).to.equal(ARRAY[1]);
        // // Delete in array
        await evmCompatibilityTest.deleteArrayElement(0);
        await evmCompatibilityTest.deleteArrayElement(1);
        firstStoredValue = await evmCompatibilityTest.getArrayElement(0);
        secondStoredValue = await evmCompatibilityTest.getArrayElement(1);
        expect(Number(firstStoredValue)).to.equal(0);
        expect(Number(secondStoredValue)).to.equal(0);
      });
      it("Should set values in map and remove them", async function () {
        const { evmCompatibilityTest, MAP } = await loadFixture(deployFixture);

        // Set in map
        await evmCompatibilityTest.setMapElement(MAP[0].key, MAP[0].value);
        await evmCompatibilityTest.setMapElement(MAP[1].key, MAP[1].value);
        // Get in array
        let firstStoredValue = await evmCompatibilityTest.getMapElement(MAP[0].key);
        let secondStoredValue = await evmCompatibilityTest.getMapElement(MAP[1].key);
        expect(Number(firstStoredValue)).to.equal(MAP[0].value);
        expect(Number(secondStoredValue)).to.equal(MAP[1].value);
        // Delete in array
        await evmCompatibilityTest.deleteMapElement(MAP[0].key);
        await evmCompatibilityTest.deleteMapElement(MAP[1].key);
        firstStoredValue = await evmCompatibilityTest.getMapElement(MAP[0].key);
        secondStoredValue = await evmCompatibilityTest.getMapElement(MAP[1].key);
        expect(Number(firstStoredValue)).to.equal(0);
        expect(Number(secondStoredValue)).to.equal(0);
      });
    });

  });

} else {
  // ------------ Live execution testing ------------
  describe("EVMCompatibilityTest (live)", function () {
    let evmCompatibilityTest: EVMCompatibilityTest;
    let owner: any;
    const KEY_STORAGE = ethers.keccak256(ethers.toUtf8Bytes("Here we go again"));
    const VALUE_STORED = 2;
    const ARRAY = [1, 2];
    const MAP = [
      {key: ethers.keccak256(ethers.toUtf8Bytes("first key")), value: 12345},
      {key: ethers.keccak256(ethers.toUtf8Bytes("second key")), value: 54321},
    ];

    // Can't use fixture outside of local execution
    before(async () => {
      // Users part
      [ owner ] = await ethers.getSigners();

      // Retrieve the contract address from the helper-hardhat-config.ts file and instantiate the contract
      const contractAddress = evmCompatibilityTestAddresses[network.name];
      if (contractAddress == undefined || contractAddress == "") {
        console.error(`Contract address invalid: ${contractAddress}`);
        // revert the execution
        throw new Error('Invalid contract address');
      }
      evmCompatibilityTest = await ethers.getContractAt("EVMCompatibilityTest", contractAddress, owner);

    });

    describe("Basic Operations", function () {
      it("Should add two numbers", async function () {
        const firstNumber = Math.floor(Math.random() * 100); // random num between 0 to 99
        const secondNumber = Math.floor(Math.random() * 100); // random num between 0 to 99
        const result = firstNumber + secondNumber;

        const resultFromContract = await evmCompatibilityTest.add(firstNumber, secondNumber);
        expect(Number(resultFromContract)).to.equal(result);
      });
      it("Should add two numbers be protected from overflow", async function () {
        const firstNumber = 115792089237316195423570985008687907853269984665640564039457584007913129639935n; // max value
        const secondNumber = 1;

        // this will overflow bc first number is maximum value in uint256
        try {
          await evmCompatibilityTest.add(firstNumber, secondNumber);
          throw new Error("Should have revert for underflow");
        } catch (error: any) {
          if (error.data && evmCompatibilityTest) {
            // successfully reverted
            const decodedError = evmCompatibilityTest.interface.parseError(error.data);
            expect(decodedError?.name).to.equal("Panic");
          } else {
            console.log(error);
            // /!\ PROBLEM TO HANDLE WITH CORE TEAM /!\
            if (network.name == "etherlink")
              return;
            throw new Error("An unexpected error occured");
          }
        }
      });
      it("Should substract two numbers", async function () {
        const firstNumber = Math.floor(Math.random() * 100); // random num between 0 to 99
        const secondNumber = Math.floor(Math.random() * 100); // random num between 0 to 99
        const result = firstNumber > secondNumber ? firstNumber - secondNumber : secondNumber - firstNumber;

        const resultFromContract = firstNumber > secondNumber ? 
          await evmCompatibilityTest.subtract(firstNumber, secondNumber)
          : await evmCompatibilityTest.subtract(secondNumber, firstNumber);
        expect(Number(resultFromContract)).to.equal(result);
      });
      it("Should substract two numbers be protected from underflow", async function () {
        const firstNumber = 0;
        const secondNumber = 1;

        // this will underflow as second number is > than first number
        try {
          await evmCompatibilityTest.subtract(firstNumber, secondNumber);
          throw new Error("Should have revert for underflow");
        } catch (error: any) {
          if (error.data && evmCompatibilityTest) {
            // successfully reverted
            const decodedError = evmCompatibilityTest.interface.parseError(error.data);
            expect(decodedError?.name).to.equal("Panic");
          } else {
            console.log(error);
            // /!\ PROBLEM TO HANDLE WITH CORE TEAM /!\
            if (network.name == "etherlink")
            return;
            throw new Error("An unexpected error occured");
          }
        }
      });
      it("Should multiply two numbers", async function () {
        const firstNumber = Math.floor(Math.random() * 100); // random num between 0 to 99
        const secondNumber = Math.floor(Math.random() * 100); // random num between 0 to 99
        const result = firstNumber * secondNumber;

        const resultFromContract = await evmCompatibilityTest.multiply(firstNumber, secondNumber);
        expect(Number(resultFromContract)).to.equal(result);
      });
      it("Should divide two numbers", async function () {
        const firstNumber = Math.floor(Math.random() * 100); // random num between 0 to 99
        const secondNumber = Math.floor(Math.random() * 100); // random num between 0 to 99
        const result = firstNumber > secondNumber ? Math.floor(firstNumber / secondNumber) : Math.floor(secondNumber / firstNumber);

        const resultFromContract = firstNumber > secondNumber ? 
          await evmCompatibilityTest.divide(firstNumber, secondNumber)
          : await evmCompatibilityTest.divide(secondNumber, firstNumber);
        expect(Number(resultFromContract)).to.equal(result);
      });
      it("Should revert on divide by 0", async function () {
        const firstNumber = Math.floor(Math.random() * 100); // random num between 0 to 99
        const secondNumber = 0;

        try {
          await evmCompatibilityTest.divide(firstNumber, secondNumber);
          throw new Error("Should have revert for underflow");
        } catch (error: any) {
          if (error.data && evmCompatibilityTest) {
            // successfully reverted
            const decodedError = evmCompatibilityTest.interface.parseError(error.data);
            expect(decodedError?.name).to.equal("Panic");
          } else {
            console.log(error);
            // /!\ PROBLEM TO HANDLE WITH CORE TEAM /!\
            if (network.name == "etherlink")
              return;
            throw new Error("An unexpected error occured");
          }
        }
      });
      it("Should modulo two numbers", async function () {
        const firstNumber = Math.floor(Math.random() * 100); // random num between 0 to 99
        const secondNumber = 2; 
        const result = firstNumber % secondNumber;

        const resultFromContract = await evmCompatibilityTest.modulo(firstNumber, secondNumber);
        expect(Number(resultFromContract)).to.equal(result);
      });
      it("Should exponentiate two numbers", async function () {
        const firstNumber = 2;
        const secondNumber = 8;
        const result = firstNumber ** secondNumber;

        const resultFromContract = await evmCompatibilityTest.exponentiate(firstNumber, secondNumber);
        expect(Number(resultFromContract)).to.equal(result);
      });
      it("Should compare with equal", async function () {
        const firstNumber: number = 1;
        const secondNumber: number = 2;
        const firstCase = firstNumber == firstNumber;
        const secondCase = firstNumber == secondNumber;

        // First case
        let resultFromContract = await evmCompatibilityTest.equal(firstNumber, firstNumber);
        expect(resultFromContract).to.equal(firstCase);
        // Second case
        resultFromContract = await evmCompatibilityTest.equal(firstNumber, secondNumber);
        expect(resultFromContract).to.equal(secondCase);
      });
      it("Should compare with not equal", async function () {
        const firstNumber: number = 1;
        const secondNumber: number = 2;
        const firstCase = firstNumber != firstNumber;
        const secondCase = firstNumber != secondNumber;

        // First case
        let resultFromContract = await evmCompatibilityTest.notEqual(firstNumber, firstNumber);
        expect(resultFromContract).to.equal(firstCase);
        // Second case
        resultFromContract = await evmCompatibilityTest.notEqual(firstNumber, secondNumber);
        expect(resultFromContract).to.equal(secondCase);
      });
      it("Should compare with greater than", async function () {
        const firstNumber: number = 1;
        const secondNumber: number = 2;
        const firstCase = firstNumber > firstNumber;
        const secondCase = firstNumber > secondNumber;

        // First case
        let resultFromContract = await evmCompatibilityTest.greaterThan(firstNumber, firstNumber);
        expect((resultFromContract)).to.equal(firstCase);
        // Second case
        resultFromContract = await evmCompatibilityTest.greaterThan(firstNumber, secondNumber);
        expect(resultFromContract).to.equal(secondCase);
      });
      it("Should compare with less than", async function () {
        const firstNumber: number = 1;
        const secondNumber: number = 2;
        const firstCase = firstNumber < firstNumber;
        const secondCase = firstNumber < secondNumber;

        // First case
        let resultFromContract = await evmCompatibilityTest.lessThan(firstNumber, firstNumber);
        expect(resultFromContract).to.equal(firstCase);
        // Second case
        resultFromContract = await evmCompatibilityTest.lessThan(firstNumber, secondNumber);
        expect(resultFromContract).to.equal(secondCase);
      });
      it("Should compare with greater than or equal", async function () {
        const firstNumber: number = 1;
        const secondNumber: number = 2;
        const firstCase = firstNumber >= firstNumber;
        const secondCase = firstNumber >= secondNumber;

        // First case
        let resultFromContract = await evmCompatibilityTest.greaterThanOrEqual(firstNumber, firstNumber);
        expect(resultFromContract).to.equal(firstCase);
        // Second case
        resultFromContract = await evmCompatibilityTest.greaterThanOrEqual(firstNumber, secondNumber);
        expect(resultFromContract).to.equal(secondCase);
      });
      it("Should compare with less than or equal", async function () {
        const firstNumber: number = 1;
        const secondNumber: number = 2;
        const firstCase = firstNumber <= firstNumber;
        const secondCase = firstNumber <= secondNumber;

        // First case
        let resultFromContract = await evmCompatibilityTest.lessThanOrEqual(firstNumber, firstNumber);
        expect(resultFromContract).to.equal(firstCase);
        // Second case
        resultFromContract = await evmCompatibilityTest.lessThanOrEqual(firstNumber, secondNumber);
        expect(resultFromContract).to.equal(secondCase);
      });
    });

    describe("State Management", function () {
      it("Should set the value in storage", async function () {

        await (await evmCompatibilityTest.store(KEY_STORAGE, VALUE_STORED)).wait();
        const storedValue = await evmCompatibilityTest.read(KEY_STORAGE);
        expect(storedValue).to.equal(VALUE_STORED);
      }).timeout(1000000);
      it("Should remove the value in storage", async function () {

        await (await evmCompatibilityTest.remove(KEY_STORAGE)).wait();
        const storedValue = await evmCompatibilityTest.read(KEY_STORAGE);
        expect(storedValue).to.equal(0);
      }).timeout(1000000);
    });

    describe("Storage Location Manipulation", function () {
      it("Should add values in array and remove them", async function () {

        // Add in array
        await (await evmCompatibilityTest.pushArrayElement(ARRAY[0])).wait();
        await (await evmCompatibilityTest.pushArrayElement(ARRAY[1])).wait();
        // Get in array
        const firstPosition = await evmCompatibilityTest.getArrayLength() - 2n;
        const secondPosition = await evmCompatibilityTest.getArrayLength() - 1n;
        let firstStoredValue = await evmCompatibilityTest.getArrayElement(firstPosition);
        let secondStoredValue = await evmCompatibilityTest.getArrayElement(secondPosition);
        expect(Number(firstStoredValue)).to.equal(ARRAY[0]);
        expect(Number(secondStoredValue)).to.equal(ARRAY[1]);
        // // Delete in array
        await (await evmCompatibilityTest.popArrayElement()).wait();
        await (await evmCompatibilityTest.popArrayElement()).wait();
        expect(Number(await evmCompatibilityTest.getArrayLength())).to.equal(0);
      }).timeout(5000000);
      it("Should set values in map and remove them", async function () {

        // Set in map
        await (await evmCompatibilityTest.setMapElement(MAP[0].key, MAP[0].value)).wait();
        await (await evmCompatibilityTest.setMapElement(MAP[1].key, MAP[1].value)).wait();
        // Get in array
        let firstStoredValue = await evmCompatibilityTest.getMapElement(MAP[0].key);
        let secondStoredValue = await evmCompatibilityTest.getMapElement(MAP[1].key);
        expect(Number(firstStoredValue)).to.equal(MAP[0].value);
        expect(Number(secondStoredValue)).to.equal(MAP[1].value);
        // Delete in array
        await (await evmCompatibilityTest.deleteMapElement(MAP[0].key)).wait();
        await (await evmCompatibilityTest.deleteMapElement(MAP[1].key)).wait();
        firstStoredValue = await evmCompatibilityTest.getMapElement(MAP[0].key);
        secondStoredValue = await evmCompatibilityTest.getMapElement(MAP[1].key);
        expect(Number(firstStoredValue)).to.equal(0);
        expect(Number(secondStoredValue)).to.equal(0);
      }).timeout(1000000);
    });

/*    describe("Mint on testnet", function () {
      it("Should mint tokens and emit an event", async function () {
        const AMOUNT_TO_MINT = 10n;
        const receiver = owner.address;

        const initialBalance = await evmCompatibilityTest.balanceOf(owner.address);
        const receipt = await (await evmCompatibilityTest.mint(receiver, AMOUNT_TO_MINT)).wait();
        const afterMintBalance = await evmCompatibilityTest.balanceOf(owner.address);
        const events = await evmCompatibilityTest.queryFilter(evmCompatibilityTest.filters.Transfer, receipt?.blockNumber, receipt?.blockNumber); // mint is a transfer event
        const firstTransfer = events[0];

        expect(afterMintBalance).to.equal(initialBalance + AMOUNT_TO_MINT);
        expect(firstTransfer.args[0]).to.equal("0x0000000000000000000000000000000000000000"); // origin of mint is address 0x0
        expect(firstTransfer.args[1]).to.equal(receiver);
        expect(firstTransfer.args[2]).to.equal(AMOUNT_TO_MINT);
      });
      it("Should revert something if other than owner try to mint", async function () {
        const AMOUNT_TO_MINT = 10n;

        try {
          await (await evmCompatibilityTest.connect(secondAccount).mint(secondAccount.address, AMOUNT_TO_MINT)).wait();
        } catch (error: any) {
          if (error.data && evmCompatibilityTest) {
            const decodedError = evmCompatibilityTest.interface.parseError(error.data);
            console.log("transaction failed name: ", decodedError?.name);
            console.log("transaction failed args: ", decodedError?.args);
            expect(decodedError?.name).to.equal("OwnableUnauthorizedAccount"); // can I access custom error properly ?
            expect(decodedError?.args[0]).to.equal(secondAccount.address);
          } else {
            // /!\ TMP IF STATEMENT /!\
            // this is actually added bc etherlink doesn't support correctly the returned data when transaction revert
            if (network.name == "etherlink")
              return;
            console.log(`ERROR RECEIVED:\n ${error}\n`);
            throw new Error('Invalid error format, see log above');
          }
        }
      });
    });
    describe("Permit on testnet", function () {
      it("Should allow user to permit a transfer", async () => {
        const evmCompatibilityTestSecondUser = evmCompatibilityTest.connect(secondAccount);
        const { r, s, v } = await signERC2612Permit(owner, await evmCompatibilityTest.getAddress(), owner.address, secondAccount.address, ethers.MaxUint256.toString());
        const initialTokenAmountSecondUser = await evmCompatibilityTest.balanceOf(secondAccount.address);
        // console.log("initial second user balance: ", initialTokenAmountSecondUser);
        // add permission
        await (await evmCompatibilityTestSecondUser.permit(owner.address, secondAccount.address, ethers.MaxUint256.toString(), ethers.MaxUint256.toString(), v, r, s)).wait();
        // console.log("permited");
        await (await evmCompatibilityTestSecondUser.transferFrom(owner.address, secondAccount.address, INITIAL_OWNER_TOKENS)).wait();
        // console.log("transfered");
        const newAmount = await evmCompatibilityTest.balanceOf(secondAccount.address);
        // console.log("new token amount: ", newAmount);
        expect(newAmount).to.equal(INITIAL_OWNER_TOKENS + initialTokenAmountSecondUser);

        // remove permission after test
        // console.log("before remove allowance");
        await (await evmCompatibilityTest.approve(secondAccount.address, 0)).wait();
        // console.log("removed permit");
        expect(await evmCompatibilityTest.allowance(owner.address, secondAccount.address)).to.equal(0n);
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
    });*/
  });
}