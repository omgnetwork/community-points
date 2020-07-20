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

const ethUtil = require('ethereumjs-util')
const sigUtil = require('eth-sig-util')
const { fromPrivate } = require('eth-lib').account
const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' })

function accountsFromEnv () {
  if (!process.env.FEE_RELAYER_PRIVATE_KEYS) {
    throw new Error('FEE_RELAYER_PRIVATE_KEYS not set')
  }
  const privKeys = process.env.FEE_RELAYER_PRIVATE_KEYS.split(',')
  return privKeys.map(pk => fromPrivate(pk.startsWith('0x') ? pk : '0x' + pk))
}

module.exports = {
  getAccounts: () => {
    if (!this.accounts) {
      this.accounts = accountsFromEnv()
    }
    return this.accounts
  },

  sign: async (toSign, address) => {
    const feePayer = this.accounts.find(account => account.address.toLowerCase() === address.toLowerCase())
    if (!feePayer) {
      throw new Error(`Address ${address} is not a fee payer account`)
    }
    logger.info(`Signing tx with fee payer account ${feePayer.address}`)
    console.log(`Buffer ${JSON.stringify(Buffer.from(feePayer.privateKey.replace('0x', ''), 'hex'))}`)
    const signed = ethUtil.ecsign(
      toSign,
      Buffer.from(feePayer.privateKey.replace('0x', ''), 'hex')
    )
    return sigUtil.concatSig(signed.v, signed.r, signed.s)
  }
}
