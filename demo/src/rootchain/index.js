const Web3 = require('web3')
const { waitForRootchainTransaction } = require('@omisego/omg-js-util')
const { unitToSubunit, subunitToUnit } = require('../util')
const Logger = require('../util/logger')

const DEPOSIT_FINALITY_MARGIN = 12

const estimateGas = async (transaction, provider) => {
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

const getBalance = async (contract, address) => {
  const balance = await contract.methods.balanceOf(address).call()
  return subunitToUnit(balance)
}

const callMint = async (contract, caller, recipient, amount, provider) => {
  const data = contract.methods
    .mint(recipient.address, unitToSubunit(amount))
    .encodeABI()

  const transaction = {
    from: caller.address,
    to: contract._address,
    data: data,
    value: 0
  }

  const gas = await estimateGas(transaction, provider)
  transaction.gas = gas * 2

  const { rawTransaction } = await caller.signTransaction(transaction)

  const receipt = await provider.eth.sendSignedTransaction(rawTransaction)
  return receipt
}

const depositEth = async (depositor, ethAmount, provider, rootchain) => {
  Logger.logDepositing(depositor.name, ethAmount, 'ETH')

  const receipt = await rootchain.deposit({
    amount: unitToSubunit(ethAmount),
    txOptions: { from: depositor.address, privateKey: depositor.privateKey }
  })

  Logger.logTransactionHash(receipt.transactionHash)

  Logger.logConfirmingDeposit(DEPOSIT_FINALITY_MARGIN)
  await waitForRootchainTransaction({
    web3: provider,
    transactionHash: receipt.transactionHash,
    checkIntervalMs: 1000,
    blocksToWait: DEPOSIT_FINALITY_MARGIN
  })

  Logger.logDepositConfirmed()

  return receipt
}

const approveErc20 = async (erc20Address, depositor, amount, rootchain) => {
  const txOptions = {
    from: depositor.address,
    privateKey: depositor.privateKey
  }
  const receipt = await rootchain.approveToken({
    erc20Address,
    amount: unitToSubunit(amount),
    txOptions
  })
  return receipt
}

const depositErc20 = async (depositor, amount, erc20, rootchain, provider) => {
  Logger.logDepositing(depositor.name, amount, erc20.symbol)

  const receipt = await rootchain.deposit({
    amount: unitToSubunit(amount),
    currency: erc20._address,
    txOptions: { from: depositor.address, privateKey: depositor.privateKey }
  })

  Logger.logTransactionHash(receipt.transactionHash)
  Logger.logConfirmingDeposit(DEPOSIT_FINALITY_MARGIN)

  await waitForRootchainTransaction({
    web3: provider,
    transactionHash: receipt.transactionHash,
    checkIntervalMs: 1000,
    blocksToWait: DEPOSIT_FINALITY_MARGIN
  })
  Logger.logDepositConfirmed()
}

module.exports = {
  approveErc20,
  callMint,
  depositEth,
  depositErc20,
  getAccount,
  getBalance,
  getContract,
  getProvider
}
