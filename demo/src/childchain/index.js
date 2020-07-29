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
const ethUtil = require('ethereumjs-util')
const sigUtil = require('eth-sig-util')
const logger = require('pino')({ prettyPrint: true })
const { OmgUtil } = require('@omisego/omg-js')
const { Accounts, Clients, Config, Contracts } = require(`../config`)
const { subunitToUnit, unitToSubunit, unitToBN } = require('../util')

const { Distributor, Alice, SubRedditServer } = Accounts

const transfer = async (sender, recipient, amount, currency) => {
  const subunitAmount = unitToSubunit(amount)

  /* construct a transaction body */
  const transactionBody = await Clients.Plasma.ChildChain.createTransaction({
    owner: sender.address,
    payments: [
      {
        owner: recipient.address,
        currency: currency,
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
  return Clients.Plasma.ChildChain.submitTransaction(signedTxn)
}

const waitForTransfer = async (
  address,
  initialBalance,
  transferAmount,
  currency
) => {
  const subunitInitialBalance = new BN(unitToSubunit(initialBalance))
  const subunitTransferAmount = new BN(unitToSubunit(transferAmount))
  const expectedAmount = subunitInitialBalance.add(subunitTransferAmount)

  await OmgUtil.waitForChildchainBalance({
    childChain: Clients.Plasma.ChildChain,
    address,
    expectedAmount,
    currency
  })
}

const getBalance = async (address, currency) => {
  const balances = await Clients.Plasma.ChildChain.getBalance(address)
  const balance = balances.find(balance => {
    return balance.currency.toLowerCase() === currency.toLowerCase()
  })

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
  return new BN(1)
}

const getSignature = (toSign, signer) => {
  logger.info(`Getting signature from ${signer.name}`)
  const signature = ethUtil.ecsign(
    toSign,
    Buffer.from(signer.privateKey.replace('0x', ''), 'hex')
  )
  return sigUtil.concatSig(signature.v, signature.r, signature.s)
}

const claimCommunityPoints = async (
  user,
  server,
  karmaPoints,
  feePayer,
  feeCurrency
) => {
  logger.info(`${user.name} is now claiming RCP`)
  const KARMA = Contracts.KARMA._address
  const RCP = Contracts.RCP._address

  logger.info('Getting transaction fees ...')
  const feeAmount = await getFeeAmount(feeCurrency)
  const usableFeeUtxos = await getUsableUtxos(
    feePayer.address,
    feeCurrency,
    feeAmount,
    false
  )

  const karmaAmount = unitToBN(karmaPoints)
  const usableKarmaUtxos = await getUsableUtxos(
    user.address,
    KARMA,
    karmaAmount,
    true
  )

  logger.info('Getting exchange rate ...')
  const exchangeRate = getExchangeRate()
  const rcpAmount = karmaAmount.div(exchangeRate)
  const usableRcpUtxos = await getUsableUtxos(
    server.address,
    RCP,
    rcpAmount,
    true
  )

  const atomicSwapBody = createAtomicSwapBody(
    user.address,
    usableKarmaUtxos[0],
    server.address,
    usableRcpUtxos[0],
    feePayer.address,
    feeAmount,
    usableFeeUtxos[0]
  )

  const typedData = OmgUtil.transaction.getTypedData(
    atomicSwapBody,
    Config.plasmaContractAddress
  )

  const toSign = OmgUtil.transaction.getToSignHash(typedData)

  const userSignature = getSignature(toSign, user)
  const serverSignature = getSignature(toSign, server)
  const feePayerSignature = getSignature(toSign, feePayer)

  const signatures = [userSignature, serverSignature, feePayerSignature]

  const signedTx = Clients.Plasma.ChildChain.buildSignedTransaction(
    typedData,
    signatures
  )

  const result = await Clients.Plasma.ChildChain.submitTransaction(signedTx)
  return result
}

const createAtomicSwapBody = (
  user,
  karmaUtxo,
  server,
  rcpUtxo,
  feePayer,
  feeAmount,
  feeUtxo
) => {
  const inputs = [karmaUtxo, rcpUtxo, feeUtxo]
  const outputs = [
    {
      outputType: 1,
      outputGuard: server,
      currency: karmaUtxo.currency,
      amount: karmaUtxo.amount
    },
    {
      outputType: 1,
      outputGuard: user,
      currency: rcpUtxo.currency,
      amount: rcpUtxo.amount
    }
  ]

  if (!feeUtxo) {
    throw new Error('No fee UTXO provided')
  }

  if (feeUtxo.amount.gt(feeAmount)) {
    const changeAmount = feeUtxo.amount.sub(feeAmount)
    outputs.push({
      outputType: 1,
      outputGuard: feePayer,
      currency: feeUtxo.currency,
      amount: changeAmount
    })
  }

  return {
    inputs,
    outputs,
    metadata: OmgUtil.transaction.NULL_METADATA
  }
}

// claimCommunityPoints(
//   Distributor,
//   Distributor,
//   '100',
//   Distributor,
//   OmgUtil.transaction.ETH_CURRENCY
// )

module.exports = { claimCommunityPoints, getBalance, transfer, waitForTransfer }
