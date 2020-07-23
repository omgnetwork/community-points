/*
  Copyright 2020 OmiseGO Pte Ltd

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

const utxoManager = require('./utxo-manager')
const transaction = require('./transaction')
const BN = require('bn.js')
const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' })

module.exports = {
  create: async function (
    childChain,
    utxos,
    amount,
    metadata,
    token,
    toAddress,
    feePayerAddress,
    feeInfo
  ) {
    // Find a fee utxo to spend
    const feeUtxos = await childChain.getUtxos(feePayerAddress)
    const feeUtxo = await utxoManager.getFeeUtxo(feeUtxos, feeInfo.currency, feeInfo.amount)
    logger.debug(`Using fee utxo ${JSON.stringify(feeUtxo)}`)

    // Create the transaction
    const tx = transaction.create(utxos[0].owner, toAddress, utxos, amount, metadata, token, [feeUtxo], feeInfo.amount, feePayerAddress)
    logger.debug(`Created tx ${JSON.stringify(tx)}`)

    // Create the transaction's typedData
    const typedData = transaction.getTypedData(tx, childChain.plasmaContractAddress)
    return { tx, typedData }
  },

  submit: async function (childChain, tx, spenderSigs, signFunc) {
    logger.debug(`relayTx.submit, tx = ${JSON.stringify(tx)}`)

    // Get the fee payer address from the tx data
    const feePayerAddress = tx.inputs[tx.inputs.length - 1].owner

    // Sign
    const typedData = transaction.getTypedData(tx, childChain.plasmaContractAddress)
    const feeSig = await signFunc(typedData, feePayerAddress)
    spenderSigs.push(feeSig)

    // Submit the transaction
    const signedTx = childChain.buildSignedTransaction(typedData, spenderSigs)
    return childChain.submitTransaction(signedTx)
  },

  cancel: async function (tx) {
    logger.debug('relayTx.cancel')
    tx.inputs.forEach(input => {
      utxoManager.cancelPending(input)
    })
  },

  validate: function (tx, spenderSigs, spendableTokens, feeInfo) {
    if (!tx.inputs || tx.inputs.length < 2) {
      throw new Error('Incorrect number of transaction inputs')
    }
    if (!tx.outputs || tx.outputs.length === 0) {
      throw new Error('Incorrect number of transaction outputs')
    }

    // Check spendInputs are spendableToken
    const spendInputs = tx.inputs.filter(input => spendableTokens.find(token => token.toLowerCase() === input.currency.toLowerCase()))
    if (spendInputs.length === 0) {
      throw new Error('Unsupported input token')
    }

    // Check that there are enough sigs for the inputs
    if (spendInputs.length !== spenderSigs.length) {
      throw new Error('Wrong number of signatures')
    }

    // Check that there are feeInputs
    const feeInputs = tx.inputs.filter(input => input.currency.toLowerCase() === feeInfo.currency.toLowerCase())
    if (feeInputs.length === 0) {
      throw new Error('No fee input')
    }

    // Check that the amount of feeToken spent by operator is exactly fee amount
    const feePayerAddress = feeInputs[0].owner
    const feePayerOutputs = tx.outputs.filter(
      output =>
        output.currency.toLowerCase() === feeInfo.currency.toLowerCase() &&
        output.outputGuard.toLowerCase() === feePayerAddress.toLowerCase()
    )
    const feeInputTotal = transaction.totalAmount(feeInputs)
    const feeOutputTotal = transaction.totalAmount(feePayerOutputs)

    if (!feeInputTotal.sub(feeOutputTotal).eq(new BN(feeInfo.amount.toString()))) {
      throw new Error('Incorrect fee')
    }
  }
}
