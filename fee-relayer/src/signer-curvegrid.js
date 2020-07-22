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

const axios = require('axios')
const JSONBigNumber = require('omg-json-bigint')
const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' })

const API_KEY = `Bearer ${process.env.CGMB_API_KEY}`
const SIGN_URL = process.env.CGMB_SIGN_URL

const SIGNER_ADDRESS = '0x697dcD14e82a0C2B084351b2542885385b181018'

function accountsFromHSM () {
  return [{ address: SIGNER_ADDRESS }]
}

async function post ({ url, body }) {
  body.jsonrpc = body.jsonrpc || '2.0'
  body.id = body.id || 0
  const options = {
    method: 'POST',
    url: url,
    headers: {
      'Content-Type': 'application/json',
      Authorization: API_KEY
    },
    data: JSONBigNumber.stringify(body)
  }
  return axios.request(options)
}

module.exports = {
  getAccounts: () => {
    if (!this.accounts) {
      this.accounts = accountsFromHSM()
    }
    return this.accounts
  },

  sign: async (typedData, address) => {
    const feePayer = this.accounts.find(account => account.address.toLowerCase() === address.toLowerCase())
    if (!feePayer) {
      throw new Error(`Address ${address} is not a fee payer account`)
    }

    logger.info(`Signing tx with fee payer account ${address}`)

    const body = {
      isTyped: true,
      address: address,
      data: typedData
    }

    try {
      const res = await post({ url: SIGN_URL, body })
      const response = res.data
      logger.info(`HSM response: ${JSON.stringify(response, null, 2)}`)
      if (!response.message || response.message !== 'success') {
        logger.error(`HSM error: ${response.message}`)
        throw new Error('Unable to sign transaction')
      }
      return response.result.signature
    } catch (err) {
      logger.error(`HSM error: ${err.stack || err}`)
      throw new Error('Unable to sign transaction')
    }
  }
}
