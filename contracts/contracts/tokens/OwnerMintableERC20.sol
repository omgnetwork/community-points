// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @dev the contract inheritences this should implement the constructor
 * For instance, constructor() public ERC20("OMG Rock Point", "ROCK") {}
 */
abstract contract OwnerMintableERC20 is ERC20, Ownable {
    function mint(address account, uint256 amount) onlyOwner public {
        ERC20._mint(account, amount);
    }
}
