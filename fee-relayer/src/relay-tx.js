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
const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' })

let feeInfo = null
async function getFeeInfo (childChain, currency) {
  if (!feeInfo) {
    const fees = (await childChain.getFees())['1']
    feeInfo = fees.find(fee => fee.currency.toLowerCase() === currency.toLowerCase())
    if (!feeInfo) {
      throw new Error(`Configured FEE_TOKEN ${currency} is not a supported fee token`)
    }
  }
  return feeInfo
}

module.exports = {
  create: async function (childChain, utxos, amount, token, toAddress, feePayerAddress, feeToken) {
    // Find a fee utxo to spend
    const { amount: feeAmount } = await getFeeInfo(childChain, feeToken)
    const feeUtxos = await childChain.getUtxos(feePayerAddress)
    const feeUtxo = await utxoManager.getFeeUtxo(feeUtxos, feeToken, feeAmount)
    logger.debug(`Using fee utxo ${JSON.stringify(feeUtxo)}`)

    // Create the transaction
    const tx = transaction.create(utxos[0].owner, toAddress, utxos, amount, token, [feeUtxo], feeAmount, feePayerAddress)
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
    const toSign = transaction.getToSignHash(typedData)
    const feeSig = await signFunc(toSign, feePayerAddress)
    spenderSigs.push(feeSig)

    // Submit the transaction
    const signedTx = childChain.buildSignedTransaction(typedData, spenderSigs)
    return childChain.submitTransaction(signedTx)
  },

  cancel: async function (tx) {
    logger.debug('relayTx.cancel')
    // TODO Mark fee utxo as usable
  }
}
