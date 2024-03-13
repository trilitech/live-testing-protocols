// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TestCreateFunctions {
    uint nonce;
    address public lastCreatedContract;

    function createContract() external returns (address newContract) {
        // Deploy a new instance of TestContract using create function
        newContract = address(new TestContract("Hello from create function"));
        lastCreatedContract = newContract;
    }

    function create2Contract() external returns (address newContract) {
        bytes32 salt = keccak256(abi.encodePacked(msg.sender, nonce));
        // Deploy a new instance of TestContract using create2 function
        newContract = address(new TestContract{salt: salt}("Hello from create2 function"));
        nonce++;
        lastCreatedContract = newContract;
    }

    function getMessageInCreated() external view returns (string memory) {
        require(lastCreatedContract != address(0), "No contract created");
        return TestContract(lastCreatedContract).message();
    }
    function setMessageInCreated(string calldata _message) external {
        require(lastCreatedContract != address(0), "No contract created");
        TestContract(lastCreatedContract).setMessage(_message);
    }
}

// Example contract that can be created
contract TestContract {
    string public message;

    constructor(string memory _message) {
        message = _message;
    }

    function setMessage(string calldata _message) external {
        message = _message;
    }
}

// Test An external caller for the created contract
contract CallerTestContract {
    function callMeThis(address testContract, string calldata _message) external {
        TestContract(testContract).setMessage(_message);
    }
}