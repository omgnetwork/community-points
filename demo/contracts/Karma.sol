// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @notice Karma ERC20 implementation contract
 */
contract Karma is ERC20 {
    constructor() public ERC20("Karma", "KARMA") {}

    function mint(address account, uint256 amount) public {
        ERC20._mint(account, amount);
    }
}
