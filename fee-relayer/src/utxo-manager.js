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

const BN = require('bn.js')

let pendingUtxos = []

function compareUtxo (a, b) {
  return a.blknum === b.blknum && a.txindex === b.txindex && a.oindex === b.oindex
}

async function cleanPending (utxos) {
  // Only hold on to pendingUtxos that are also in utxos. Any that are not have already been spent.
  pendingUtxos = pendingUtxos.filter(pending => utxos.some(utxo => compareUtxo(utxo, pending)))
}

module.exports = {
  getFeeUtxo: async (utxos, feeToken, feeAmount) => {
    // Filter by currency and not pending, and sort by amount
    const validUtxos = utxos
      .filter(utxo => utxo.currency.toLowerCase() === feeToken.toLowerCase())
      .filter(utxo => !pendingUtxos.some(pending => compareUtxo(utxo, pending)))
      .sort((a, b) => new BN(b.amount).sub(new BN(a.amount)))

    // Use the highest value valid utxo
    const utxo = validUtxos[0]

    // Check that it can cover the fee
    if (!utxo || new BN(utxo.amount).lt(new BN(feeAmount))) {
      throw new Error(`Insufficient funds to cover fee amount ${feeAmount}`)
    }

    // Mark utxo as 'pending'
    pendingUtxos.push(utxo)

    // Clean up pending utxos.
    cleanPending(utxos)

    return utxo
  },

  cancelPending: (utxo) => {
    pendingUtxos = pendingUtxos.filter(item => !compareUtxo(item, utxo))
  }
}
