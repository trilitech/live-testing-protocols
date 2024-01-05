// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

interface ILogic {
    function getNumber() external view returns(int);
    function initalValue(int) external;
    function modify() external;
    function version() external pure returns(string memory);
}