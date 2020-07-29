require('dotenv').config(); // auto parse env variables from '.env' file

const HDWalletProvider = require('@truffle/hdwallet-provider');

const deployerPrivateKey = process.env.DEPLOYER_PRIVATEKEY || '0'.repeat(64); // use 0 address to force failure

module.exports = {
  networks: {
    development: {
     host: "127.0.0.1",     // Localhost (default: none)
     port: 8545,            // Standard Ethereum port (default: none)
     network_id: "*",       // Any network (default: none)
    },
    remote: {
      skipDryRun: true,
      provider: () => new HDWalletProvider(
        deployerPrivateKey,
        process.env.REMOTE_URL || 'http://127.0.0.1:8545',
      ),
      gasPrice: process.env.GAS_PRICE || 20000000000, // default 20 gwei
      network_id: '*',
    },
  },
  compilers: {
    solc: {
      version: "0.6.10",
    }
  }
}
