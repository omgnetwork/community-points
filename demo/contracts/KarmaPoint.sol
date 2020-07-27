// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @notice Karma Point ERC20 implementation contract
 */
contract KarmaPoint is ERC20 {
    constructor() public ERC20("Karma Token", "KRP") {}

    function mint(address account, uint256 amount) public {
        ERC20._mint(account, amount);
    }
}
