const Web3 = require('web3')
const pino = require('pino')({ prettyPrint: true })

const estimateGas = async (provider, transaction) => {
  const gas = await provider.eth.estimateGas(transaction)
  return gas
}

const getProvider = provider => {
  return new Web3(provider)
}

const getContract = (provider, interface, address) => {
  return new provider.eth.Contract(interface, address)
}

const getAccount = (provider, privateKey) => {
  return provider.eth.accounts.privateKeyToAccount(privateKey)
}

const getPointBalance = async (contract, address) => {
  const balance = await contract.methods.balanceOf(address).call()
  return balance
}

const mint = async (provider, contract, caller, recipient, amount) => {
  const data = contract.methods.mint(recipient.address, amount).encodeABI()

  const transaction = {
    from: caller.address,
    to: contract._address,
    data: data,
    value: 0
  }

  const gas = await estimateGas(provider, transaction)
  transaction.gas = gas * 2

  const { rawTransaction } = await caller.signTransaction(transaction)

  const receipt = await provider.eth.sendSignedTransaction(rawTransaction)
  return receipt
}

const Logger = {
  logBalance: (addressName, tokenName, network, balance) =>
    pino.info(
      `${tokenName} balance for ${addressName} on ${network} is now: ${balance}`
    ),
  logContractAddress: (addressName, address) => {
    pino.info(`${addressName} contract address is: ${address}`)
  },
  logMinting: (caller, amount, tokenSymbol) => {
    pino.info(`${caller} is now minting ${amount} ${tokenSymbol} ...`)
  },
  logTransactionHash: hash => {
    pino.info(`Transaction hash is: ${hash}`)
  }
}

module.exports = {
  getAccount,
  getContract,
  getPointBalance,
  getProvider,
  Logger,
  mint
}
