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

const pendingUtxos = []

module.exports = {
  getFeeUtxo: async function (utxos, feeToken, feeAmount) {
    // Filter by currency and not pending, and sort by amount
    const validUtxos = utxos
      .filter(utxo => utxo.currency.toLowerCase() === feeToken.toLowerCase())
      .filter(utxo => !pendingUtxos.includes(utxo))
      .sort((a, b) => new BN(b.amount).sub(new BN(a.amount)))

    // Use the highest value valid utxo
    const utxo = validUtxos[0]

    // Check that it can cover the fee
    if (!utxo || new BN(utxo.amount).lt(new BN(feeAmount))) {
      throw new Error(`Insufficient funds to cover fee amount ${feeAmount}`)
    }

    // Mark utxo as 'pending'
    pendingUtxos.push(utxo)

    // TODO use utxos to clean up pending utxos so that it doesn't keep growing.

    return utxo
  }
}
