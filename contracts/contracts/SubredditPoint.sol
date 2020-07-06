// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @notice Subreddit point ERC20 implementation contract
 *
 * Owner of this contract can mint the token. As a result, the ownership should be transfered to the distribution contract.
 * We will mint the point in L1 and distribute in L2.
 */
contract SubredditPoint is ERC20, Ownable {
    constructor() public ERC20("OMG Reddit Point", "ORP") {}

    function mint(address account, uint256 amount) onlyOwner public {
        ERC20._mint(account, amount);
    }
}
