# OMG Community Points Engine

## Description

The demo application that creates scalable Community Points systems on the OMG Network. The proposed implementation contains the following components:

1. `/client` - a browser extension to interact with a given Community Points platform, such as Reddit.
2. `/fee-relayer` - the server-side of the Community Points Engine.
3. `/contracts` - a set of smart contracts that power the Community Points Engine.

## Development

Each component is created as an individual project, thus follow the instructions of a specific component of the repository.

## Prerequisites

- A prior experience with JavaScript, [web3.js](https://github.com/ethereum/web3.js) and preferrably [omg-js](https://github.com/omgnetwork/omg-js) libraries.
- Funds to cover contracts deployment and transaction fees.
- An experience with Solidity and deploying Ethereum smart contracts.
- A fully synced Ethereum node for a given environment (local or infrastructure provider, e.g. [Infura](https://infura.io/)).
- A Web3 wallet, such as [MetaMask](https://metamask.io/).
- A Chrome or Brave browser.

## API Documentation

The application uses the following APIs:
- [omg-js API](https://docs.omg.network/omg-js)
- [Watcher Informational API](https://docs.omg.network/elixir-omg/docs-ui/?urls.primaryName=master%2Finfo_api_specs)
- [Fee-relayer API](https://github.com/omgnetwork/community-points/blob/master/fee-relayer/swagger/swagger.yaml)
- [Reddit API](https://www.reddit.com/dev/api/)
- [MultiBaas API](https://www.curvegrid.com/)