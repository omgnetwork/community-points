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
const { transaction } = require('@omisego/omg-js-util')

const NULL_METADATA = '0x0000000000000000000000000000000000000000000000000000000000000000'

module.exports = {
  create: function (from, to, spendUtxos, spendAmount, metadata, spendToken, feeUtxos, feeAmount, feeOwner) {
    if (!spendUtxos || spendUtxos.length === 0) {
      throw new Error('spendUtxos is empty')
    }
    if (!feeUtxos || feeUtxos.length === 0) {
      throw new Error('feeUtxos is empty')
    }

    spendAmount = BN.isBN(spendAmount) ? spendAmount : new BN(spendAmount.toString())
    feeAmount = BN.isBN(feeAmount) ? feeAmount : new BN(feeAmount.toString())

    const spendTotal = totalAmount(spendUtxos)
    if (spendTotal.lt(spendAmount)) {
      throw new Error('Insufficient inputs to cover amount')
    }

    const feeTotal = totalAmount(feeUtxos)

    if (feeTotal.lt(feeAmount)) {
      throw new Error('Insufficient fee inputs to cover fee')
    }

    const encodedMetadata = metadata
      ? transaction.encodeMetadata(metadata)
      : NULL_METADATA

    // Construct the tx body
    const txBody = {
      inputs: [...spendUtxos, ...feeUtxos],
      outputs: [{
        outputType: 1,
        outputGuard: to,
        currency: spendToken,
        amount: spendAmount
      }],
      metadata: encodedMetadata
    }

    // Check if we need to add a change output for the spend token
    if (spendTotal.gt(spendAmount)) {
      const changeAmount = spendTotal.sub(spendAmount)
      txBody.outputs.push({
        outputType: 1,
        outputGuard: from,
        currency: spendToken,
        amount: changeAmount
      })
    }

    // Check if we need to add a change output for the fee token
    if (feeTotal.gt(feeAmount)) {
      const changeAmount = feeTotal.sub(feeAmount)
      txBody.outputs.push({
        outputType: 1,
        outputGuard: feeOwner,
        currency: feeUtxos[0].currency,
        amount: changeAmount
      })
    }

    return txBody
  },

  getTypedData: (txBody, verifyingContract) => {
    return transaction.getTypedData(txBody, verifyingContract)
  },

  getToSignHash: (typedData) => {
    return transaction.getToSignHash(typedData)
  }
}

function totalAmount (utxos) {
  return utxos.reduce((prev, curr) => {
    return prev.add(new BN(curr.amount.toString()))
  }, new BN(0))
}
