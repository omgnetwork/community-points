# Reddit Community Point Contracts

## Deploy the contracts
### Env var settings
1. Set the `DEPLOYER_PRIVATEKEY` for the private key of the account used to deploy the contracts. This address should have some ETH.
1. Set the `SUBREDDIT_OWNER` for the address of subreddit owner.
1. (Optional) Set the `REMOTE_URL` for the infura or external eth client. Default to `http://127.0.0.1:8545`
1. (Optional) Set the `GAS_PRICE` for the gas price used to deploy the contracts.

### Deploy
1. Barebone command: (Before running the command, setup the env vars either directly or via an `.env` file)
    ```sh
    npx truffle migrate --network remote
    ```
1. Docker command:
    ```sh
    # build the docker image
    docker build -t point-contracts-deployer .

    # deploy the contracts
    docker run --rm \
    -e SUBREDDIT_OWNER=<subreddit owner address> \
    -e DEPLOYER_PRIVATEKEY=<private key for deployer> \
    -e REMOTE_URL=<remote eth client url or infura url> \
    point-contracts-deployer npx truffle migrate --network remote
    ```

## Update the ABIs
All abis should be in `abis` folder. To update the ABIs, run:
```
npm run export-abi
```
This will auto recompile all contracts and fetch the ABI part to the files in `abis` folder.
