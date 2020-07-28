const Web3 = require('web3')
const pino = require('pino')({ prettyPrint: true })
const BigNumber = require('bignumber.js')
const { waitForRootchainTransaction } = require('@omisego/omg-js-util')

const constants = require('./constants')

const getChildChainBalance = async (childchain, address, currency) => {
  const balances = await childchain.getBalance(address)
  const balance = balances.find(balance => {
    return balance.currency.toLowerCase() === currency.toLowerCase()
  })

  if (!balance) return '0'
  else
    return typeof balance === 'string'
      ? normalizeBalance(balance, currency)
      : normalizeBalance(new BigNumber(balance.amount).toString(), currency)
}

const normalizeBalance = (balance, currency) => {
  if (currency === constants.currency.ETH) {
    return new Web3().utils.fromWei(balance, 'ether')
  }
  /* Both tokens have decimal precision of 18*/
  const divider = new BigNumber(10).pow(18)
  return new BigNumber(balance).dividedBy(divider).toFixed()
}

const depositEth = async (rootchain, provider, depositor, ethAmount) => {
  Logger.logDepositing(depositor.name, ethAmount, 'ETH')

  const receipt = await rootchain.deposit({
    amount: convertEthToWei(ethAmount),
    txOptions: { from: depositor.address, privateKey: depositor.privateKey }
  })

  Logger.logTransactionHash(receipt.transactionHash)

  await waitForRootchainTransaction({
    web3: provider,
    transactionHash: receipt.transactionHash,
    checkIntervalMs: 1000,
    blocksToWait: 10,
    onCountdown: remaining =>
      pino.info(`${remaining} blocks remaining before deposit confirmation`)
  })

  pino.info('Deposit successful.')

  return receipt
}

const depositErc20 = async (
  rootchain,
  provider,
  depositor,
  amount,
  currency,
  currencySymbol
) => {
  Logger.logDepositing(depositor.name, amount, currencySymbol)
  const multiplier = new BigNumber(10).pow(18)
  /* Both tokens have decimal precision of 18*/
  const subunitAmount = new BigNumber(amount).times(multiplier).toFixed()
  const receipt = await rootchain.deposit({
    amount: subunitAmount,
    currency,
    txOptions: { from: depositor.address, privateKey: depositor.privateKey }
  })

  Logger.logTransactionHash(receipt.transactionHash)

  await waitForRootchainTransaction({
    web3: provider,
    transactionHash: receipt.transactionHash,
    checkIntervalMs: 1000,
    blocksToWait: 12,
    onCountdown: remaining =>
      pino.info(`${remaining} blocks remaining before deposit confirmation`)
  })

  pino.info('Deposit successful.')

  return receipt
}

const estimateGas = async (provider, transaction) => {
  const gas = await provider.eth.estimateGas(transaction)
  return gas
}

const convertEthToWei = amount => {
  return new Web3().utils.toWei(amount)
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
  const divider = new BigNumber(10).pow(18)
  return new BigNumber(balance).dividedBy(divider).toFixed()
}

const mint = async (provider, contract, caller, recipient, amount) => {
  const multiplier = new BigNumber(10).pow(18)
  /* Both tokens have decimal precision of 18*/
  const data = contract.methods
    .mint(recipient.address, new BigNumber(amount).times(multiplier).toFixed())
    .encodeABI()

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

const approveErc20 = async (rootchain, erc20Address, depositor, amount) => {
  const multiplier = new BigNumber(10).pow(18)
  /* Both tokens have decimal precision of 18*/
  const subunitAmount = new BigNumber(amount).times(multiplier).toFixed()

  const txOptions = {
    from: depositor.address,
    privateKey: depositor.privateKey
  }
  const receipt = await rootchain.approveToken({
    erc20Address,
    amount: subunitAmount,
    txOptions
  })
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
  },
  logDepositing: (depositor, amount, tokenSymbol) => {
    pino.info(
      `${depositor} is depositing ${amount} ${tokenSymbol} onto the OMG Network.`
    )
  },
  logApprovingErc20: (erc20, amount) => {
    pino.info(`Approving ${amount} ${erc20} for deposit to the OMG Network.`)
  }
}

module.exports = {
  approveErc20,
  depositEth,
  depositErc20,
  getAccount,
  getChildChainBalance,
  getContract,
  getPointBalance,
  getProvider,
  Logger,
  mint
}
