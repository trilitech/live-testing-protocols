// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

contract Logic_positive {
    int public number;

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