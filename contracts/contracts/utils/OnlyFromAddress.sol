// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.6.0;

contract OnlyFromAddress {

    modifier onlyFrom(address caller) {
        require(msg.sender == caller, "Caller address is unauthorized");
        _;
    }
}
