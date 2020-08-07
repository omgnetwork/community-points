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
const MAX_OUTPUTS = 4

function splitAmount (amount, numParts) {
  if (numParts === 1) {
    return [amount]
  }

  const a = amount.divn(numParts)
  const ret = new Array(numParts - 1).fill(a)
  ret.push(amount.sub(a.muln(numParts - 1)))
  return ret
}

module.exports = {
  create: function (
    from,
    to,
    spendUtxos,
    spendAmount,
    metadata,
    spendToken,
    feeUtxos,
    feeAmount,
    feeOwner,
    splitFeeOutput = false
  ) {
    if (!spendUtxos || spendUtxos.length === 0) {
      throw new Error('spendUtxos is empty')
    }
    if (!feeUtxos || feeUtxos.length === 0) {
      throw new Error('feeUtxos is empty')
    }

    spendAmount = BN.isBN(spendAmount) ? spendAmount : new BN(spendAmount.toString())
    feeAmount = BN.isBN(feeAmount) ? feeAmount : new BN(feeAmount.toString())

    const spendTotal = this.totalAmount(spendUtxos)
    if (spendTotal.lt(spendAmount)) {
      throw new Error('Insufficient inputs to cover amount')
    }

    const feeTotal = this.totalAmount(feeUtxos)

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

      const numNonFeeOutputs = spendTotal.gt(spendAmount) ? 2 : 1
      const maxNumFeeOutputs = MAX_OUTPUTS - numNonFeeOutputs

      if (splitFeeOutput && changeAmount.gte(feeAmount.muln(maxNumFeeOutputs))) {
        const amounts = splitAmount(changeAmount, maxNumFeeOutputs)
        amounts.forEach(amount =>
          txBody.outputs.push({
            outputType: 1,
            outputGuard: feeOwner,
            currency: feeUtxos[0].currency,
            amount
          }))
      } else {
        txBody.outputs.push({
          outputType: 1,
          outputGuard: feeOwner,
          currency: feeUtxos[0].currency,
          amount: changeAmount
        })
      }
    }

    return txBody
  },

  getTypedData: (txBody, verifyingContract) => {
    return transaction.getTypedData(txBody, verifyingContract)
  },

  getToSignHash: (typedData) => {
    return transaction.getToSignHash(typedData)
  },

  totalAmount: (utxos) => {
    return utxos.reduce((prev, curr) => {
      return prev.add(new BN(curr.amount.toString()))
    }, new BN(0))
  }
}
