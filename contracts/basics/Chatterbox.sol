// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./BasicStorage.sol";

/// @dev Basic contract to make message calls to BasicStorage contract
contract Chatterbox {
    BasicStorage public basicStorage;

    constructor(BasicStorage _basicStorage) {
        basicStorage = _basicStorage;
    }

    function setTarget(BasicStorage _basicStorage) public {
        basicStorage = _basicStorage;
    }

    function retrieveTargetNumber() public view returns(uint256) {
        return basicStorage.number();
    }

    function addToTarget(uint256 _number) public returns(uint256) {
        return basicStorage.addToNumber(_number);
    }

    function substractToTarget(uint256 _number) public returns(uint256) {
        return basicStorage.substractToNumber(_number);
    }

    function multiplyToTarget(uint256 _number) public returns(uint256) {
        return basicStorage.multiplyToNumber(_number);
    }

    function divideToTarget(uint256 _number) public returns(uint256) {
        return basicStorage.divideToNumber(_number);
    }
}
