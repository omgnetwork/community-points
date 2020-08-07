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

const ethUtil = require('ethereumjs-util')
const sigUtil = require('eth-sig-util')
const logger = require('pino')({ prettyPrint: true })
const { transaction } = require('@omisego/omg-js-util')

const createTransactionBody = (
  alice,
  aliceUtxo,
  bob,
  bobUtxo,
  feePayer,
  feeAmount,
  feeUtxo
) => {
  const transactionBody = {
    inputs: [aliceUtxo, bobUtxo, feeUtxo],
    outputs: [
      createOutput(bob, aliceUtxo.currency, aliceUtxo.amount),
      createOutput(alice, bobUtxo.currency, bobUtxo.amount)
    ],
    metadata: transaction.NULL_METADATA
  }

  if (!feeUtxo) {
    throw new Error('No fee UTXO provided')
  }

  if (feeUtxo.amount.gt(feeAmount)) {
    const feeChangeAmount = feeUtxo.amount.sub(feeAmount)
    const feeChangeOutput = createOutput(
      feePayer,
      feeUtxo.currency,
      feeChangeAmount
    )
    transactionBody.outputs.push(feeChangeOutput)
  }

  return transactionBody
}

const createOutput = (owner, currency, amount) => ({
  outputType: 1,
  outputGuard: owner,
  currency,
  amount
})

const getSignatures = (typedData, alice, bob, feePayer) => {
  const toSign = transaction.getToSignHash(typedData)

  const aliceSignature = getSignature(toSign, alice)
  const bobSignature = getSignature(toSign, bob)
  const feePayerSignature = getSignature(toSign, feePayer)

  return [aliceSignature, bobSignature, feePayerSignature]
}

const getSignature = (toSign, signer) => {
  logger.info(`Getting signature from ${signer.name}`)
  const signature = ethUtil.ecsign(
    toSign,
    Buffer.from(signer.privateKey.replace('0x', ''), 'hex')
  )
  return sigUtil.concatSig(signature.v, signature.r, signature.s)
}

module.exports = { createTransactionBody, getSignatures }
