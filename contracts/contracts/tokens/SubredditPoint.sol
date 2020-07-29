// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.6.0;

import "./OwnerMintableERC20.sol";

/**
 * @notice Subreddit point ERC20 implementation contract
 *
 * Owner of this contract can mint the token. As a result, the ownership should be transferred to the distribution contract.
 * We will mint the point in L1 and distribute in L2.
 */
contract SubredditPoint is OwnerMintableERC20 {
    constructor() public ERC20("OMG Rock Point", "ROCK") {}
}
