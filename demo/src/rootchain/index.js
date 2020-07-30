/*
  Copyright 2019 OmiseGO Pte Ltd

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

const Web3 = require('web3')
const { waitForRootchainTransaction } = require('@omisego/omg-js-util')
const { unitToSubunit, subunitToUnit } = require('../util')
const logger = require('pino')({ prettyPrint: true })

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

const getBalance = async (contract, account) => {
  const balance = await contract.methods.balanceOf(account.address).call()
  const unitBalance = subunitToUnit(balance)
  logger.info(
    `${contract.symbol} balance for ${account.name} on Ethereum Network is now ${unitBalance}`
  )
  return unitBalance
}

const callMint = async (contract, caller, recipient, amount, provider) => {
  logger.info(
    `${recipient.name} is now minting ${amount} ${contract.symbol} ...`
  )
  const data = contract.methods
    .mint(recipient.address, unitToSubunit(amount))
    .encodeABI()

  const transaction = {
    from: caller.address,
    to: contract.address,
    data: data,
    value: 0
  }

  const gas = await estimateGas(transaction, provider)
  transaction.gas = gas * 2

  const { rawTransaction } = await caller.signTransaction(transaction)

  const receipt = await provider.eth.sendSignedTransaction(rawTransaction)
  logger.info(`Transaction hash is ${receipt.transactionHash}`)
  return receipt
}

const depositEth = async (depositor, ethAmount, provider, rootchain) => {
  logger.info(
    `${depositor.name} is depositing ${ethAmount} ETH onto the OMG Network.`
  )

  const receipt = await rootchain.deposit({
    amount: unitToSubunit(ethAmount),
    txOptions: { from: depositor.address, privateKey: depositor.privateKey }
  })
  logger.info(`Transaction hash is ${receipt.transactionHash}`)

  logger.info(
    `Awaiting ${DEPOSIT_FINALITY_MARGIN} blocks to be mined for deposit confirmation ...`
  )
  await waitForRootchainTransaction({
    web3: provider,
    transactionHash: receipt.transactionHash,
    checkIntervalMs: 1000,
    blocksToWait: DEPOSIT_FINALITY_MARGIN
  })

  logger.info('Deposit confirmed')

  return receipt
}

const approveErc20 = async (erc20, depositor, amount, rootchain) => {
  logger.info(
    `Approving ${amount} ${erc20.symbol} for deposit to the OMG Network.`
  )

  const txOptions = {
    from: depositor.address,
    privateKey: depositor.privateKey
  }
  const receipt = await rootchain.approveToken({
    erc20Address: erc20.address,
    amount: unitToSubunit(amount),
    txOptions
  })
  logger.info(`Transaction hash is ${receipt.transactionHash}`)

  return receipt
}

const depositErc20 = async (depositor, amount, erc20, rootchain, provider) => {
  logger.info(
    `${depositor.name} is depositing ${amount} ${erc20.symbol} onto the OMG Network.`
  )
  const receipt = await rootchain.deposit({
    amount: unitToSubunit(amount),
    currency: erc20.address,
    txOptions: { from: depositor.address, privateKey: depositor.privateKey }
  })
  logger.info(`Transaction hash is ${receipt.transactionHash}`)

  logger.info(
    `Awaiting ${DEPOSIT_FINALITY_MARGIN} blocks to be mined for deposit confirmation ...`
  )
  await waitForRootchainTransaction({
    web3: provider,
    transactionHash: receipt.transactionHash,
    checkIntervalMs: 1000,
    blocksToWait: DEPOSIT_FINALITY_MARGIN
  })
  logger.info('Deposit confirmed')
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
