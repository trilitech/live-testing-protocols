// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "./ILogic.sol";

contract Logic_positive is ILogic {
    int public number;

    function getNumber() external view returns(int) {
        return number;
    }

    /// @dev Initializer
    function initalValue(int initialNumber) external {
        number = initialNumber;
    }

    function modify() external {
        number += 1;
    }

    function version() external pure returns(string memory) {
        return "positive";
    }
}