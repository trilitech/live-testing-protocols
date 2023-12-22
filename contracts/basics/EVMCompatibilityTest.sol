// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @dev Version 1 of the tests
contract EVMCompatibilityTest {

        // Constructor
    uint256 immutable public universalNumber;
    constructor(uint256 _universalNumber) {
        universalNumber = _universalNumber;
    }

        // Basic Operations

    function add(uint256 a, uint256 b) public pure returns (uint256) {
        return a + b;
    }

    function subtract(uint256 a, uint256 b) public pure returns (uint256) {
        return a - b;
    }

    function multiply(uint256 a, uint256 b) public pure returns (uint256) {
        return a * b;
    }

    function divide(uint256 a, uint256 b) public pure returns (uint256) {
        return a / b;
    }

    function modulo(uint256 a, uint256 b) public pure returns (uint256) {
        return a % b;
    }

    function exponentiate(uint256 a, uint256 n) public pure returns (uint256) {
        return a**n;
    }

    function equal(uint256 a, uint256 b) public pure returns (bool) {
        return a == b;
    }

    function notEqual(uint256 a, uint256 b) public pure returns (bool) {
        return a != b;
    }

    function greaterThan(uint256 a, uint256 b) public pure returns (bool) {
        return a > b;
    }

    function lessThan(uint256 a, uint256 b) public pure returns (bool) {
        return a < b;
    }

    function greaterThanOrEqual(uint256 a, uint256 b) public pure returns (bool) {
        return a >= b;
    }

    function lessThanOrEqual(uint256 a, uint256 b) public pure returns (bool) {
        return a <= b;
    }

        // State Management

    function store(uint256 key, uint256 value) public {
        // Store value at given key in storage
        assembly {
            sstore(key, value)
        }
    }

    function read(uint256 key) public view returns (uint256 value) {
        // Read value from storage at given key
        assembly {
            value := sload(key)
        }
    }

    function remove(uint256 key) public {
        // Delete value from storage at given key
        assembly {
            sstore(key, 0)
        }
    }

        // Storage Location Manipulation

    mapping(uint256 => uint256) public mappings;
    uint256[] public array;

    function addArrayElement(uint256 key, uint256 value) public {
        // Set element at given index in array
        array[key] = value;
    }

    function pushArrayElement(uint256 value) public {
        // Set element at given index in array
        array.push(value);
    }


    function getArrayElement(uint256 arrayIndex) public view returns (uint256) {
        // Get element at given index from array
        return array[arrayIndex];
    }

    function deleteArrayElement(uint256 arrayIndex) public {
        delete array[arrayIndex];
    }

    // Fail on hardhat local...
    function popArrayElement() public {
        array.pop(); 
    }

    function getArrayLength() public view returns(uint256) {
        return array.length;
    }

    function setMapElement(uint256 key, uint256 value) public {
        // Set element at given index in map
        mappings[key] = value;
    }

    function getMapElement(uint256 key) public view returns (uint256) {
        // Get element at given index from map
        return mappings[key];
    }

    function deleteMapElement(uint256 key) public {
        delete mappings[key];
    }
    
        // Control Flow

    function ifElse(bool condition) public pure returns(bool) {
        if (condition) {
            // Execute code if condition is true
            return false;
        } else {
            // Execute code if condition is false
            return true;
        }
    }

    function loopFor(uint256 start, uint256 end) public pure returns(uint256 counter) {
        counter = 0;
        for (uint256 i = start; i < end; i++) {
            // Execute code for each iteration of the loop
            counter++;
        }
    }

    function loopWhile(uint256 end) public pure returns(uint256 counter) {
        uint i = 0;
        counter = 0;
        while (i < end) {
            // Execute code while the condition is true
            i++;
            counter++;
        }
    }

        // Exceptions and Error Handling

    error MyCustomError(string errorMessage);

    function revertExceptionWithCustomError(string memory errorMessage) public pure {
        revert MyCustomError(errorMessage);
    }

    function requireException(bool shouldTrigger) public pure {
        require(shouldTrigger == false, "Message from require");
    }

    function assertException(bool shouldTrigger) public pure {
        assert(shouldTrigger == false);
    }

    function revertException() public pure {
        revert("I am reverting");
    }

    // This should always return true
    function handleException() public view returns(bool) {
        // Handle exceptions thrown
        try this.revertException() {
            return false;
        } catch {
            return true;
        }
    }

        // Global variables & builtin symbol

    function getEther(uint256 amount) public pure returns(uint256) {
        return amount * 1 ether;
    }

    function getGwei(uint256 amount) public pure returns(uint256) {
        return amount * 1 gwei;
    }

    function getWei(uint256 amount) public pure returns(uint256) {
        return amount * 1 wei;
    }

    // block keywork
    function getBlockNumber() public view returns(uint256) {
        return block.number;
    }

    function getBlockTimestamp() public view returns(uint256) {
        return block.timestamp;
    }

    function getBlockCoinbase() public view returns(address) {
        return block.coinbase;
    }

    // Old block.difficulty
    // Return always 0 on etherlink
    function getBlockPrevrandao() public view returns(uint256) {
        return block.prevrandao;
    }

    function getBlockGasLimit() public view returns(uint256) {
        return block.gaslimit;
    }

    // ERROR ON ETHERLINK
    // Patch inc
    // function getBlockhash(uint blockNumber) public view returns(bytes32) {
    //     return blockhash(blockNumber);
    // }

    // tx keyword
    function getTransactionOrigin() public view returns(address) {
        return tx.origin;
    }

    function getTransactionGasPrice() public view returns(uint256) {
        return tx.gasprice;
    }

    // msg keywork
    function getMsgSender() public view returns(address) {
        return msg.sender;
    }

    // return nothing but revert if value send is different from parameter
    function getMsgValue(uint256 valueToCheck) public payable {
        require(valueToCheck == msg.value);
    }

    function getMsgData() public pure returns(bytes memory) {
        return msg.data;
    }

    function getGasleft() public view returns(uint256) {
        return gasleft();
    }

        // Hashing

    function useKeccak256(bytes memory data) public pure returns (bytes32) {
        return keccak256(data);
    }

    function useSha256(bytes memory data) public pure returns (bytes32) {
        return sha256(data);
    }

    function useRipemd160(bytes memory data) public pure returns (bytes20) {
        return ripemd160(data);
    }


        // Encoding & Decoding

    function encodeAndDecodeData(string memory inputString) public pure returns (string memory) {
        // Encode the string
        bytes memory encoded = abi.encode(inputString);

        // Decode the string
        string memory decoded = abi.decode(encoded, (string));

        // Return the decoded string
        return decoded;
    }

        // Custom type

    struct MyCustomType {
        uint256 id;
        uint8 number;
        string message;
    }

    mapping(uint256 => MyCustomType) public myTypes;

    function addCustomType(uint256 key, uint256 _id, uint8 _number, string memory _message) public {
        myTypes[key] = MyCustomType(_id, _number, _message);
    }

    function getCustomType(uint256 key) public view returns(MyCustomType memory) {
        return myTypes[key];
    }

    function deleteCustomType(uint256 key) public {
        delete myTypes[key];
    }


        // Fallback system & events

    event Receive(uint256 amount);
    event Fallback(uint256 amount);

    receive() external payable {
        emit Receive(msg.value);
    }

    fallback() external payable {
        emit Fallback(msg.value);
    }
}