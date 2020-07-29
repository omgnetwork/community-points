// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.6.0;

import "./OwnerMintableERC20.sol";

/**
 * @notice Subscription token contract
 */
contract Subscription is OwnerMintableERC20 {
    constructor(string memory name, string memory symbol) public ERC20(name, symbol) {}
}
