import { deployments, ethers, network } from "hardhat";
import { expect } from "chai";
import { EVMCompatibilityTest } from "../../typechain-types";
import { developmentChains } from "../../helper-hardhat-config";

const setup = deployments.createFixture(async ({deployments, getNamedAccounts, ethers}, options) => {
  if (developmentChains.includes(network.name))
    await deployments.fixture(); // ensure you start from a fresh deployments
  const { deployer } = await getNamedAccounts();
  const evmCompatibilityTest = await ethers.getContract('EVMCompatibilityTest', deployer) as EVMCompatibilityTest;
  const KEY_STORAGE = ethers.keccak256(ethers.toUtf8Bytes("Here we go again"));
  const VALUE_STORED = 2;
  const ARRAY = [1, 2];
  const MAP = [
    {key: ethers.keccak256(ethers.toUtf8Bytes("first key")), value: 12345},
    {key: ethers.keccak256(ethers.toUtf8Bytes("second key")), value: 54321},
  ];

  return { deployer, evmCompatibilityTest, KEY_STORAGE, VALUE_STORED, ARRAY, MAP };
});

describe('EVMComptaibilityTest', () => {
  describe("Basic Operations", function () {
    it("Should add two numbers", async function () {
      const { evmCompatibilityTest } = await setup();
      const firstNumber = Math.floor(Math.random() * 100); // random num between 0 to 99
      const secondNumber = Math.floor(Math.random() * 100); // random num between 0 to 99
      const result = firstNumber + secondNumber;

      const resultFromContract = await evmCompatibilityTest.add(firstNumber, secondNumber);
      expect(Number(resultFromContract)).to.equal(result);
    });
    it("Should add two numbers be protected from overflow", async function () {
      const { evmCompatibilityTest } = await setup();
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
          // /!\ PROBLEM TO HANDLE WITH CORE TEAM /!\
          if (network.name == "etherlink" || network.name == "nightly") {
            console.log("protection for etherlink (and nightly), problem to handle")
            return;
          }
          console.log(error);
          throw new Error("An unexpected error occured");
        }
      }
    });
    it("Should substract two numbers", async function () {
      const { evmCompatibilityTest } = await setup();
      const firstNumber = Math.floor(Math.random() * 100); // random num between 0 to 99
      const secondNumber = Math.floor(Math.random() * 100); // random num between 0 to 99
      const result = firstNumber > secondNumber ? firstNumber - secondNumber : secondNumber - firstNumber;

      const resultFromContract = firstNumber > secondNumber ? 
        await evmCompatibilityTest.subtract(firstNumber, secondNumber)
        : await evmCompatibilityTest.subtract(secondNumber, firstNumber);
      expect(Number(resultFromContract)).to.equal(result);
    });
    it("Should substract two numbers be protected from underflow", async function () {
      const { evmCompatibilityTest } = await setup();
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
          // /!\ PROBLEM TO HANDLE WITH CORE TEAM /!\
          if (network.name == "etherlink" || network.name == "nightly") {
            console.log("protection for etherlink (and nightly), problem to handle")
            return;
          }
          console.log(error);
          throw new Error("An unexpected error occured");
        }
      }
    });
    it("Should multiply two numbers", async function () {
      const { evmCompatibilityTest } = await setup();
      const firstNumber = Math.floor(Math.random() * 100); // random num between 0 to 99
      const secondNumber = Math.floor(Math.random() * 100); // random num between 0 to 99
      const result = firstNumber * secondNumber;

      const resultFromContract = await evmCompatibilityTest.multiply(firstNumber, secondNumber);
      expect(Number(resultFromContract)).to.equal(result);
    });
    it("Should divide two numbers", async function () {
      const { evmCompatibilityTest } = await setup();
      const firstNumber = Math.floor(Math.random() * 100) + 1; // random num between 1 to 100
      const secondNumber = Math.floor(Math.random() * 100) + 1; // random num between 1 to 100
      const result = firstNumber > secondNumber ? Math.floor(firstNumber / secondNumber) : Math.floor(secondNumber / firstNumber);

      const resultFromContract = firstNumber > secondNumber ? 
        await evmCompatibilityTest.divide(firstNumber, secondNumber)
        : await evmCompatibilityTest.divide(secondNumber, firstNumber);
      expect(Number(resultFromContract)).to.equal(result);
    });
    it("Should revert on divide by 0", async function () {
      const { evmCompatibilityTest } = await setup();
      const firstNumber = Math.floor(Math.random() * 100); // random num between 0 to 99
      const secondNumber = 0;

      // Will always revert because / by 0
      try {
        await evmCompatibilityTest.divide(firstNumber, secondNumber);
        throw new Error("Should have revert for underflow");
      } catch (error: any) {
        if (error.data && evmCompatibilityTest) {
          // successfully reverted
          const decodedError = evmCompatibilityTest.interface.parseError(error.data);
          expect(decodedError?.name).to.equal("Panic");
        } else {
          // /!\ PROBLEM TO HANDLE WITH CORE TEAM /!\
          if (network.name == "etherlink" || network.name == "nightly") {
            console.log("protection for etherlink (and nightly), problem to handle")
            return;
          }
          console.log(error);
          throw new Error("An unexpected error occured");
        }
      }
    });
    it("Should modulo two numbers", async function () {
      const { evmCompatibilityTest } = await setup();
      const firstNumber = Math.floor(Math.random() * 100); // random num between 0 to 99
      const secondNumber = 2; 
      const result = firstNumber % secondNumber;

      const resultFromContract = await evmCompatibilityTest.modulo(firstNumber, secondNumber);
      expect(Number(resultFromContract)).to.equal(result);
    });
    it("Should exponentiate two numbers", async function () {
      const { evmCompatibilityTest } = await setup();
      const firstNumber = 2;
      const secondNumber = 8;
      const result = firstNumber ** secondNumber;

      const resultFromContract = await evmCompatibilityTest.exponentiate(firstNumber, secondNumber);
      expect(Number(resultFromContract)).to.equal(result);
    });
    it("Should compare with equal", async function () {
      const { evmCompatibilityTest } = await setup();
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
      const { evmCompatibilityTest } = await setup();
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
      const { evmCompatibilityTest } = await setup();
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
      const { evmCompatibilityTest } = await setup();
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
      const { evmCompatibilityTest } = await setup();
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
      const { evmCompatibilityTest } = await setup();
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
      const { evmCompatibilityTest, KEY_STORAGE, VALUE_STORED } = await setup();

      // Store VALUE_STORED in the storage KEY_STORAGE
      await (await evmCompatibilityTest.store(KEY_STORAGE, VALUE_STORED)).wait();
      const storedValue = await evmCompatibilityTest.read(KEY_STORAGE);
      expect(storedValue).to.equal(VALUE_STORED);
    }).timeout(1000000);
    it("Should remove the value in storage", async function () {
      const { evmCompatibilityTest, KEY_STORAGE } = await setup();

      // Remove from VALUE_STORED from the storage KEY_STORAGE
      await (await evmCompatibilityTest.remove(KEY_STORAGE)).wait();
      const storedValue = await evmCompatibilityTest.read(KEY_STORAGE);
      expect(storedValue).to.equal(0);
    }).timeout(1000000);
  });

  describe("Storage Location Manipulation", function () {
    it("Should add values in array and remove them", async function () {
      const { evmCompatibilityTest, ARRAY } = await setup();

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
      const { evmCompatibilityTest, MAP } = await setup();

      // Set in map
      await (await evmCompatibilityTest.setMapElement(MAP[0].key, MAP[0].value)).wait();
      await (await evmCompatibilityTest.setMapElement(MAP[1].key, MAP[1].value)).wait();
      // Get in map
      let firstStoredValue = await evmCompatibilityTest.getMapElement(MAP[0].key);
      let secondStoredValue = await evmCompatibilityTest.getMapElement(MAP[1].key);
      expect(Number(firstStoredValue)).to.equal(MAP[0].value);
      expect(Number(secondStoredValue)).to.equal(MAP[1].value);
      // Delete in map
      await (await evmCompatibilityTest.deleteMapElement(MAP[0].key)).wait();
      await (await evmCompatibilityTest.deleteMapElement(MAP[1].key)).wait();
      firstStoredValue = await evmCompatibilityTest.getMapElement(MAP[0].key);
      secondStoredValue = await evmCompatibilityTest.getMapElement(MAP[1].key);
      expect(Number(firstStoredValue)).to.equal(0);
      expect(Number(secondStoredValue)).to.equal(0);
    }).timeout(1000000);
  });

  describe("Control Flow", function () {
    it("Should handle if and else", async function () {
      const { evmCompatibilityTest } = await setup();
      const caseOne = true;
      const caseTwo = false;
      const resultOne = !caseOne;
      const resultTwo = !caseTwo;

      expect(await evmCompatibilityTest.ifElse(caseOne)).to.equal(resultOne);
      expect(await evmCompatibilityTest.ifElse(caseTwo)).to.equal(resultTwo);
    });
    it("Should increase a counter with for loop", async function () {
      const { evmCompatibilityTest } = await setup();
      const starting = 0;
      const ending = 20;
      const counter = ending - starting;

      expect(Number(await evmCompatibilityTest.loopFor(starting, ending))).to.equal(counter);
    });
    it("Should increase a counter with while loop", async function () {
      const { evmCompatibilityTest } = await setup();
      const ending = 30;
      const counter = ending;

      expect(Number(await evmCompatibilityTest.loopWhile(ending))).to.equal(counter);
    });
  });

  describe("Exceptions and Error Handling", function () {
    it("Should handle revert custom error", async function () {
      const { evmCompatibilityTest } = await setup();
      const errorMessage = "Art is an explosion";

      // this should revert
      try {
        await evmCompatibilityTest.revertExceptionWithCustomError(errorMessage);
        throw new Error("Should have revert");
      } catch (error: any) {
        if (error.data && evmCompatibilityTest) {
          // successfully reverted
          const decodedError = evmCompatibilityTest.interface.parseError(error.data);
          expect(decodedError?.name).to.equal("MyCustomError");
          expect(decodedError?.args[0]).to.equal(errorMessage);
        } else {
          // /!\ PROBLEM TO HANDLE WITH CORE TEAM /!\
          if (network.name == "etherlink" || network.name == "nightly") {
            console.log("protection for etherlink (and nightly), problem to handle")
            return;
          }
          console.log(error);
          throw new Error("An unexpected error occured");
        }
      }
    });
    it("Should handle require statement", async function () {
      const { evmCompatibilityTest } = await setup();

      // this should not revert
      await evmCompatibilityTest.requireException(false);

      // this should revert
      try {
        await evmCompatibilityTest.requireException(true);
        throw new Error("Should have revert");
      } catch (error: any) {
        if (error.data && evmCompatibilityTest) {
          // successfully reverted
          const decodedError = evmCompatibilityTest.interface.parseError(error.data);
          expect(decodedError?.name).to.equal("Error");
          expect(decodedError?.args[0]).to.equal("Message from require");
        } else {
          // /!\ PROBLEM TO HANDLE WITH CORE TEAM /!\
          if (network.name == "etherlink" || network.name == "nightly") {
            console.log("protection for etherlink (and nightly), problem to handle")
            return;
          }
          console.log(error);
          throw new Error("An unexpected error occured");
        }
      }
    });
    it("Should handle assert statement", async function () {
      const { evmCompatibilityTest } = await setup();

      // this should not revert
      await evmCompatibilityTest.assertException(false);

      // this should revert
      try {
        await evmCompatibilityTest.assertException(true);
        throw new Error("Should have revert");
      } catch (error: any) {
        if (error.data && evmCompatibilityTest) {
          // successfully reverted
          const decodedError = evmCompatibilityTest.interface.parseError(error.data);
          expect(decodedError?.name).to.equal("Panic");
        } else {
          // /!\ PROBLEM TO HANDLE WITH CORE TEAM /!\
          if (network.name == "etherlink" || network.name == "nightly") {
            console.log("protection for etherlink (and nightly), problem to handle")
            return;
          }
          console.log(error);
          throw new Error("An unexpected error occured");
        }
      }
    });
    it("Should handle revert statement", async function () {
      const { evmCompatibilityTest } = await setup();

      // this should revert
      try {
        await evmCompatibilityTest.revertException();
        throw new Error("Should have revert");
      } catch (error: any) {
        if (error.data && evmCompatibilityTest) {
          // successfully reverted
          const decodedError = evmCompatibilityTest.interface.parseError(error.data);
          expect(decodedError?.name).to.equal("Error");
          expect(decodedError?.args[0]).to.equal("I am reverting");
        } else {
          // /!\ PROBLEM TO HANDLE WITH CORE TEAM /!\
          if (network.name == "etherlink" || network.name == "nightly") {
            console.log("protection for etherlink (and nightly), problem to handle")
            return;
          }
          console.log(error);
          throw new Error("An unexpected error occured");
        }
      }
    });
    it("Should handle exception directly inside solidity", async function () {
      const { evmCompatibilityTest } = await setup();

      // Should always return true
      expect(await evmCompatibilityTest.handleException()).to.equal(true);
    });
  });

  describe("Global variables & builtin symbol", function () {
    it("Should handle ether, gwei and wei keywords", async function () {
      const { evmCompatibilityTest } = await setup();
      const initialNumber = 2;
      const valueInEther = ethers.parseUnits(initialNumber.toString(), "ether");
      const valueInGwei = ethers.parseUnits(initialNumber.toString(), "gwei");
      const valueInWei = ethers.parseUnits(initialNumber.toString(), "wei");

      expect(await evmCompatibilityTest.getEther(initialNumber)).to.equal(valueInEther);
      expect(await evmCompatibilityTest.getGwei(initialNumber)).to.equal(valueInGwei);
      expect(await evmCompatibilityTest.getWei(initialNumber)).to.equal(valueInWei);
    });
    it("Should handle the block keywork", async function () {
      const { evmCompatibilityTest } = await setup();

      expect(await evmCompatibilityTest.getBlockNumber()).to.not.be.lessThan(0);
      expect(await evmCompatibilityTest.getBlockTimestamp()).to.not.equal(0); // error on nightly ?
      // there are no miner in etherlink
      if (network.name == "etherlink" || network.name == "nightly") {
        expect(await evmCompatibilityTest.getBlockCoinbase()).to.equal("0x0000000000000000000000000000000000000000");
      } else {
        expect(await evmCompatibilityTest.getBlockCoinbase()).to.not.equal("0x0000000000000000000000000000000000000000");
      }
      // return always 0 on etherlink (EIP-4399 not supported)
      if (network.name == "etherlink" || network.name == "nightly") {
        expect(Number(await evmCompatibilityTest.getBlockPrevrandao())).to.equal(0);
      } else {
        expect(Number(await evmCompatibilityTest.getBlockPrevrandao())).to.not.equal(0);
      }
      expect(Number(await evmCompatibilityTest.getBlockGasLimit())).to.not.equal(0);
      // Test removed cause not supported on etherlink atm -> see if targeting block 1 is ok
      expect(await evmCompatibilityTest.getBlockhash(1)).to.not.equal("0x0000000000000000000000000000000000000000000000000000000000000000");
    });
    it("Should handle the tx keywork", async function () {
      const { evmCompatibilityTest, deployer } = await setup();

      expect(await evmCompatibilityTest.getTransactionOrigin()).to.equal(deployer);
      expect(Number(await evmCompatibilityTest.getTransactionGasPrice())).to.not.be.lessThan(0);
    });
    it("Should handle the msg keywork", async function () {
      const { evmCompatibilityTest, deployer } = await setup();
      const valueToUse = 3;

      expect(await evmCompatibilityTest.getMsgSender()).to.equal(deployer);
      // pass if no revert
      await (await evmCompatibilityTest.getMsgValue(valueToUse, {value: valueToUse})).wait();
      expect(await evmCompatibilityTest.getMsgData()).to.equal(ethers.id("getMsgData()").substring(0, 10));
      expect(await evmCompatibilityTest.getGasleft()).to.be.greaterThan(0);
    }).timeout(1000000);
  });

  describe("Hashing", function () {
    it("Should handle keccak256", async function () {
      const { evmCompatibilityTest } = await setup();
      const dataToHash = "let me disapear";
      const dataBytes = ethers.toUtf8Bytes(dataToHash);
      const hashed = ethers.keccak256(dataBytes);

      expect(await evmCompatibilityTest.useKeccak256(dataBytes)).to.equal(hashed);
    });
    it("Should handle sha256", async function () {
      const { evmCompatibilityTest } = await setup();
      const dataToHash = "let me disapear";
      const dataBytes = ethers.toUtf8Bytes(dataToHash);
      const hashed = ethers.sha256(dataBytes);

      expect(await evmCompatibilityTest.useSha256(dataBytes)).to.equal(hashed);
    });
    it("Should handle ripemd160", async function () {
      const { evmCompatibilityTest } = await setup();
      const dataToHash = "let me disapear";
      const dataBytes = ethers.toUtf8Bytes(dataToHash);
      const hashed = ethers.ripemd160(dataBytes);

      expect(await evmCompatibilityTest.useRipemd160(dataBytes)).to.equal(hashed);
    });
  });

  describe("Encoding & Decoding", function () {
    it("Should handle encode and decode process", async function () {
      const { evmCompatibilityTest } = await setup();
      const message = "Top secret message";

      expect(await evmCompatibilityTest.encodeAndDecodeData(message)).to.equal(message);
    });
  });

  describe("Custom type", function () {
    it("Should add and remove a struct from a map", async function () {
      const { evmCompatibilityTest } = await setup();
      const key =Math.floor(Math.random() * 100); // random num between 0 to 99 
      const id = Math.floor(Math.random() * 100); // random num between 0 to 99
      const number = Math.floor(Math.random() * 100); // random num between 0 to 99
      const message = "Message in a struct";

      // Add it
      await (await evmCompatibilityTest.addCustomType(key, id, number, message)).wait();
      // Retreive
      let storedData = await evmCompatibilityTest.getCustomType(key);
      expect(Number(storedData[0])).to.equal(id);
      expect(Number(storedData[1])).to.equal(number);
      expect(storedData[2]).to.equal(message);
      // Delete
      await (await evmCompatibilityTest.deleteCustomType(key)).wait();
      storedData = await evmCompatibilityTest.getCustomType(key);
      expect(Number(storedData[0])).to.equal(0);
      expect(Number(storedData[1])).to.equal(0);
      expect(storedData[2]).to.equal("");
    }).timeout(1000000);
  });

  describe("Fallback system & events", function () {
    // Test removed cause not supported on etherlink atm
    it("Should trigger the receive function and emit an event", async function () {
      const { evmCompatibilityTest } = await setup();
      const evmCompatibilityTestAddress = await evmCompatibilityTest.getAddress();
      const amountToSend = ethers.parseUnits("1", "wei");
      const [ owner ] = await ethers.getSigners(); // take the first account from the config

      const initialBalance = await ethers.provider.getBalance(evmCompatibilityTestAddress);
      const receipt = await (await owner.sendTransaction({to: evmCompatibilityTestAddress, value: amountToSend})).wait();
      // console.log("the receipt: ", receipt);
      const events = await evmCompatibilityTest.queryFilter(evmCompatibilityTest.filters.Receive, receipt?.blockNumber, receipt?.blockNumber); // mint is a transfer event
      // console.log("the events: ", events);
      const balanceAfter = await ethers.provider.getBalance(evmCompatibilityTestAddress);
      expect(events[0].args[0]).to.equal(amountToSend);
      expect(balanceAfter).to.equal(initialBalance + amountToSend);
    }).timeout(1000000);
    it("Should trigger the fallback function and emit an event", async function () {
      const { evmCompatibilityTest } = await setup();
      const evmCompatibilityTestAddress = await evmCompatibilityTest.getAddress();
      const amountToSend = ethers.parseUnits("1", "wei");
      const dataToSend = "0x12345678"; // correspond to a random method signature
      const [ owner ] = await ethers.getSigners(); // take the first account from the config

      const initialBalance = await ethers.provider.getBalance(evmCompatibilityTestAddress);
      const receipt = await (await owner.sendTransaction({data: dataToSend, to: evmCompatibilityTestAddress, value: amountToSend})).wait();
      const events = await evmCompatibilityTest.queryFilter(evmCompatibilityTest.filters.Fallback, receipt?.blockNumber, receipt?.blockNumber); // mint is a transfer event
      const balanceAfter = await ethers.provider.getBalance(evmCompatibilityTestAddress);
      expect(events[0].args[0]).to.equal(amountToSend);
      expect(balanceAfter).to.equal(initialBalance + amountToSend);
    }).timeout(1000000);
  });
});

