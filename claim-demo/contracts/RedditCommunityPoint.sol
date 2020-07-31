// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @notice Reddit Community Point ERC20 implementation contract
 */
contract RedditCommunityPoint is ERC20 {
    constructor() public ERC20("Community Point", "RCP") {}

    function mint(address account, uint256 amount) public {
        ERC20._mint(account, amount);
    }
}
