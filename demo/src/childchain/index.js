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

const BN = require('bn.js')
const OmgUtil = require('@omisego/omg-js-util')
const logger = require('pino')({ prettyPrint: true })

const AtomicSwap = require('./atomic-swap')
const { Clients, Config } = require(`../config`)
const { subunitToUnit, unitToSubunit, unitToBN } = require('../util')

const transfer = async (sender, recipient, amount, currency) => {
  logger.info(
    `${sender.name} is now transfering ${amount} ${currency.symbol} to ${recipient.name} on the OMG Network.`
  )

  const subunitAmount = unitToSubunit(amount)

  /* construct a transaction body */
  const transactionBody = await Clients.Plasma.ChildChain.createTransaction({
    owner: sender.address,
    payments: [
      {
        owner: recipient.address,
        currency: currency.address,
        amount: new BN(subunitAmount)
      }
    ],
    fee: {
      currency: OmgUtil.transaction.ETH_CURRENCY
    }
  })

  /* sanitize transaction into the correct typedData format */
  /* the second parameter is the address of the RootChain contract */
  const typedData = OmgUtil.transaction.getTypedData(
    transactionBody.transactions[0],
    Config.plasmaContractAddress
  )
  /* define private keys to use for transaction signing */
  const privateKeys = new Array(
    transactionBody.transactions[0].inputs.length
  ).fill(sender.privateKey)

  /*  locally sign typedData with passed private keys, useful for multiple different signatures */
  const signatures = Clients.Plasma.ChildChain.signTransaction(
    typedData,
    privateKeys
  )

  /* return encoded and signed transaction ready to be submitted */
  const signedTxn = Clients.Plasma.ChildChain.buildSignedTransaction(
    typedData,
    signatures
  )

  /* submit to the child chain */
  const receipt = await Clients.Plasma.ChildChain.submitTransaction(signedTxn)
  logger.info(`Transaction hash is ${receipt.txhash}`)
  return receipt
}

const waitForTransfer = async (
  account,
  initialBalance,
  transferAmount,
  currency
) => {
  logger.info('Waiting for transaction to be recorded by the Watcher ...')

  const subunitInitialBalance = new BN(unitToSubunit(initialBalance))
  const subunitTransferAmount = new BN(unitToSubunit(transferAmount))
  const expectedAmount = subunitInitialBalance.add(subunitTransferAmount)

  await OmgUtil.waitForChildchainBalance({
    childChain: Clients.Plasma.ChildChain,
    address: account.address,
    expectedAmount,
    currency: currency.address
  })
}

const getBalance = async (account, currency) => {
  const balances = await Clients.Plasma.ChildChain.getBalance(account.address)
  const balance = balances.find(balance => {
    return balance.currency.toLowerCase() === currency.address.toLowerCase()
  })
  const unitBalance = balance ? subunitToUnit(balance.amount) : '0'

  logger.info(
    `${currency.symbol} balance for ${account.name} on OMG Network is now ${unitBalance}`
  )
  return balance ? subunitToUnit(balance.amount) : '0'
}

const getFeeAmount = async currency => {
  const fees = await Clients.Plasma.ChildChain.getFees()
  const selectedFee = fees['1'].find(fee => fee.currency === currency)
  return BN.isBN(selectedFee.amount)
    ? selectedFee.amount
    : new BN(selectedFee.amount.toString())
}

const getUsableUtxos = async (owner, currency, spendAmount, filterEqual) => {
  const utxos = await Clients.Plasma.ChildChain.getUtxos(owner)
  return utxos
    .filter(utxo => {
      return utxo.currency.toLowerCase() === currency.toLowerCase()
    })
    .filter(utxo => {
      const amount = BN.isBN(utxo.amount)
        ? utxo.amount
        : new BN(utxo.amount.toString())
      return filterEqual ? amount.eq(spendAmount) : amount.gte(spendAmount)
    })
}

const getExchangeRate = () => {
  /* Hard-coded for simplicity */
  return new BN(1)
}

const claimCommunityPoints = async (
  redeemer,
  redeemableCurrency,
  redeemableAmount,
  claimProcessor,
  claimableCurrency,
  feePayer,
  feeCurrency
) => {
  /* Retrieve fees for given currency. */
  const feeAmount = await getFeeAmount(feeCurrency)

  /* Derive UTXOs usable for fee payment. */
  const feeUtxos = await getUsableUtxos(
    feePayer.address,
    feeCurrency,
    feeAmount,
    false
  )

  redeemableAmount = unitToBN(redeemableAmount)

  /* Derive UTXOs for the redemption given the amount */
  const redeemableUtxos = await getUsableUtxos(
    redeemer.address,
    redeemableCurrency,
    redeemableAmount,
    true
  )

  /* Derive UTXOs sendable to the user for given redemption amount and "exchange rate" */
  const exchangeRate = getExchangeRate()
  const claimableAmount = redeemableAmount.div(exchangeRate)
  const claimableUtxos = await getUsableUtxos(
    claimProcessor.address,
    claimableCurrency,
    claimableAmount,
    true
  )

  /* Create the transaction body - maximum 1 UTXO for currency being swapped */
  const atomicSwapBody = AtomicSwap.createTransactionBody(
    redeemer.address,
    redeemableUtxos[0],
    claimProcessor.address,
    claimableUtxos[0],
    feePayer.address,
    feeAmount,
    feeUtxos[0]
  )

  /* Get typed data for atomic swap */
  const typedData = OmgUtil.transaction.getTypedData(
    atomicSwapBody,
    Config.plasmaContractAddress
  )

  /* Collect signatures */
  const signatures = AtomicSwap.getSignatures(
    typedData,
    redeemer,
    claimProcessor,
    feePayer
  )

  /* Build signed transaction */
  const signedTx = Clients.Plasma.ChildChain.buildSignedTransaction(
    typedData,
    signatures
  )

  /* Submit signed transaction */
  const receipt = await Clients.Plasma.ChildChain.submitTransaction(signedTx)
  logger.info(`Transaction hash is ${receipt.txhash}`)
  return receipt
}

module.exports = { claimCommunityPoints, getBalance, transfer, waitForTransfer }
