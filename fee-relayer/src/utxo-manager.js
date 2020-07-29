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
const axios = require('axios')
const JSONBigNumber = require('omg-json-bigint')
const { Mutex } = require('async-mutex')
const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' })

let currentNumUtxos = 0
let pendingUtxos = []
let cachedUtxos = []
let shouldRefreshUtxoCache = true
const cacheMutex = new Mutex()

const FEE_RELAYER_DESIRED_NUM_UTXOS = process.env.FEE_RELAYER_DESIRED_NUM_UTXOS || 100

function compareUtxo (a, b) {
  return a.blknum === b.blknum && a.txindex === b.txindex && a.oindex === b.oindex
}

module.exports = {
  getFeeUtxo: async function (childChain, feePayerAddress, feeToken, feeAmount) {
    let validUtxos = await this.getValidUtxos(childChain, feePayerAddress, feeToken.toLowerCase())

    // Sort by value
    validUtxos = validUtxos.sort((a, b) => new BN(b.amount).sub(new BN(a.amount)))

    // Use the highest value valid utxo
    const utxo = validUtxos[0]

    // Check that it can cover the fee
    if (!utxo || new BN(utxo.amount).lt(new BN(feeAmount))) {
      throw new Error(`Address ${feePayerAddress} has insufficient funds in ${validUtxos.length} valid utxos to cover fee amount ${feeAmount}`)
    }

    // Mark utxo as 'pending'
    pendingUtxos.push(utxo)

    return utxo
  },

  cancelPending: function (utxo) {
    pendingUtxos = pendingUtxos.filter(item => !compareUtxo(item, utxo))
  },

  cleanPending: function (utxos) {
    // Only hold on to pendingUtxos that are also in utxos. Any that are not have already been spent.
    pendingUtxos = pendingUtxos.filter(pending => utxos.some(utxo => compareUtxo(utxo, pending)))
  },

  needMoreUtxos: function () {
    return currentNumUtxos < FEE_RELAYER_DESIRED_NUM_UTXOS
  },

  getValidUtxos: async function (childChain, address, feeToken) {
    const utxos = await this.getUtxos(childChain, address, feeToken)

    // Remove pending utxos
    const validUtxos = utxos.filter(utxo => !pendingUtxos.some(pending => compareUtxo(utxo, pending)))

    // Refresh the cache asynchronously if necessary
    this.refresh(childChain, address, feeToken.toLowerCase(), validUtxos.length)

    return validUtxos
  },

  getUtxos: async function (childChain, address, feeToken) {
    if (shouldRefreshUtxoCache) {
      const release = await cacheMutex.acquire()
      try {
        if (shouldRefreshUtxoCache) {
          shouldRefreshUtxoCache = false

          // Get utxos from the network
          cachedUtxos = await getAllFeeUtxos(childChain, address, feeToken)
          currentNumUtxos = cachedUtxos.length
          logger.debug(`Refreshed cached utxos, fee relayer has ${currentNumUtxos} fee utxos`)

          // Clean up pending utxos.
          this.cleanPending(cachedUtxos)
        }
      } finally {
        release()
      }
    }

    return cachedUtxos
  },

  initCache: async function (childChain, address, feeToken) {
    shouldRefreshUtxoCache = true
    return this.getUtxos(childChain, address, feeToken)
  },

  refresh: async function (childChain, address, feeToken, numValid) {
    if (numValid < (FEE_RELAYER_DESIRED_NUM_UTXOS / 2)) {
      logger.debug(`Address ${address} only has ${numValid} valid utxos. Will refresh cache.`)
      shouldRefreshUtxoCache = true
    }
    this.getUtxos(childChain, address, feeToken)
  }
}

async function getAllFeeUtxos (childChain, address, feeToken, utxos = [], page = 1) {
  const options = {
    method: 'POST',
    url: `${childChain.watcherUrl}/account.get_utxos`,
    headers: { 'Content-Type': 'application/json' },
    data: JSONBigNumber.stringify({
      address,
      limit: 200,
      page
    }),
    transformResponse: [(data) => data]
  }
  const res = await axios.request(options)

  let data
  try {
    data = JSONBigNumber.parse(res.data)
  } catch (err) {
    throw new Error(`Unable to parse response from server: ${err}`)
  }

  if (data.success) {
    utxos = utxos.concat(data.data.filter(utxo => utxo.currency === feeToken))
    if (data.data.length < data.data_paging.limit) {
      return utxos
    }
    return getAllFeeUtxos(childChain, address, feeToken, utxos, data.data_paging.page + 1)
  }

  throw new Error(data.data)
}
