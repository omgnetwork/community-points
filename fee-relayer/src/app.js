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

require('dotenv').config()
const relayTx = require('./relay-tx')
const signer = require('./signer')
const { ChildChain } = require('@omisego/omg-js')
const express = require('express')
const bodyParser = require('omg-body-parser')
const JSONBigNumber = require('omg-json-bigint')
const createMiddleware = require('@apidevtools/swagger-express-middleware');
const pino = require('pino')
const expressPino = require('express-pino-logger')
const BN = require('bn.js')

const childChain = new ChildChain({
  watcherUrl: process.env.OMG_WATCHER_URL,
  plasmaContractAddress: process.env.OMG_PLASMA_CONTRACT
})
const feeToken = process.env.OMG_FEE_TOKEN
const port = process.env.FEE_RELAYER_PORT || 3333
const spendableToken = process.env.FEE_RELAYER_SPENDABLE_TOKEN

const app = express()
app.use(bodyParser.json())

const logger = pino({ level: process.env.LOG_LEVEL || 'info' })
const expressLogger = expressPino({ logger })
app.use(expressLogger)

createMiddleware('./swagger/swagger.yaml', app, function (err, middleware) {
  app.use(
    middleware.files(),
    middleware.metadata(),
    middleware.parseRequest(),
    middleware.validateRequest(),
  );

  app.post('/create-relayed-tx', async (req, res) => {
    try {
      logger.info(`/create-relayed-tx: from ${req.body.utxos[0].owner}, to ${req.body.to}, amount ${req.body.amount}`)
      const tx = await relayTx.create(
        childChain,
        req.body.utxos,
        req.body.amount,
        spendableToken,
        req.body.to,
        signer.getAddress(),
        feeToken
      )
      res.type('application/json')
      res.send(JSONBigNumber.stringify(tx, null, 2))
    } catch (err) {
      res.status(500)
      res.send(err.toString())
    }
  })

  app.post('/submit-relayed-tx', async (req, res) => {
    try {
      // TODO validate body params
      const result = await relayTx.submit(
        childChain,
        req.body.typedData,
        req.body.signatures,
        signer.sign
      )
      res.send(result)
    } catch (err) {
      res.status(500)
      res.send(err.toString())
    }
  })

  app.post('/cancel-relayed-tx', async (req, res) => {
    try {
      // TODO validate body params
      relayTx.cancel(req.body.tx)
      res.send('')
    } catch (err) {
      res.status(500)
      res.send(err.toString())
    }
  })

  app.listen(port, () => logger.info('Server running on port %d', port))
});