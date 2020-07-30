// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.6.0;

import "./OwnerMintableERC20.sol";

/**
 * @notice ERC20 token for Reddit Karma
 */
contract Karma is OwnerMintableERC20 {
    constructor() public ERC20("Karma", "KARMA") {}
}
