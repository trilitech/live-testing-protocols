// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @dev Basic contract to test message calls from other contracts
contract BasicStorage {
    uint256 public number;

    function setNumber(uint256 _number) public {
        number = _number;
    }

    function addToNumber(uint256 _number) public returns(uint256) {
        number += _number;
        return number;
    }

    function substractToNumber(uint256 _number) public returns(uint256) {
        number -= _number;
        return number;
    }

    function multiplyToNumber(uint256 _number) public returns(uint256) {
        number *= _number;
        return number;
    }

    // do not test with 0 otherwise it will revert
    function divideToNumber(uint256 _number) public returns(uint256) {
        number /= _number;
        return number;
    }
}
