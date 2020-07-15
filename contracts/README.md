# Reddit Community Point Contracts

## Deploy the contracts
1. Set the `DEPLOYER_PRIVATEKEY` in the `.env` file for the private key of the account used to deploy the contracts. This address should have some ETH.
1. Set the `SUBREDDIT_OWNER` in the `.env` file for the address of subreddit owner.
1. (Optional) Set the `REMOTE_URL` in the `.env` for the infura or external eth client. Default to `http://127.0.0.1:8545`
1. (Optional) Set the `GAS_PRICE` in the `.env` for the gas price used to deploy the contracts.
1. Run the following command to deploy the contract:
    ```
    npx truffle migrate --network remote
    ```
