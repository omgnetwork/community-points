# Claim Demo Script

## Installation

Install dependencies by running `npm install` from the root.

## Configuration

Create an `.env` file in the root folder and add your configuration variables.

Note that your distribution address must have a minimum amount of ETH to cover fees on the Ethereum and OMG Networks.

### Ropsten

```env
DISTRIBUTION_ADDRESS=<ADDRESS>
DISTRIBUTION_ADDRESS_PRIVATE_KEY=<ADDRESS_PRIVATE_KEY>
CONTRACT_ADDRESS_KARMA=0xdE3FFa88958B6722376bD21365b593b12CC7De30
CONTRACT_ADDRESS_RCP=0x3F442d1a3802b06927f0Dc7b721706345eAA6DA6
CONTRACT_ADDRESS_PLASMA_FRAMEWORK=0x9d9ad8a9baa52a10a6958dfe31ac504f6d62427d
WATCHER_URL=https://development-watcher-info-rinkeby-lr.omg.network/
WEB3_PROVIDER=https://rinkeby.infura.io/v3/<ACCESS_KEY>
```

### Rinkeby

```env
DISTRIBUTION_ADDRESS=<ADDRESS>
DISTRIBUTION_ADDRESS_PRIVATE_KEY=<ADDRESS_PRIVATE_KEY>
CONTRACT_ADDRESS_KARMA=0x5D2983fb0c4A12E995E9b6eFB1a54565f0e3dE12
CONTRACT_ADDRESS_RCP=0x63b909ff99b41959412D8c305349D46683a5b5bF
CONTRACT_ADDRESS_PLASMA_FRAMEWORK=0x96d5d8bc539694e5fa1ec0dab0e6327ca9e680f9
WATCHER_URL=https://watcher-info.ropsten.v1.omg.network/
WEB3_PROVIDER=https://ropsten.infura.io/v3/<ACCESS_KEY>
```

## Running

- Run the script with `npm run claim`.
- View Ethereum transactions on Etherscan.
- View OMG Network transactions on the OMG Network Block Explorer.
