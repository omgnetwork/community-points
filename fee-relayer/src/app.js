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
const accountSelector = require('./account-selector')
const { ChildChain } = require('@omisego/omg-js')
const express = require('express')
const bodyParser = require('omg-body-parser')
const JSONBigNumber = require('omg-json-bigint')
const createMiddleware = require('@apidevtools/swagger-express-middleware')
const pino = require('pino')
const cors = require('cors')
const expressPino = require('express-pino-logger')
const process = require('process')

const childChain = new ChildChain({
  watcherUrl: process.env.OMG_WATCHER_URL,
  plasmaContractAddress: process.env.OMG_PLASMA_CONTRACT
})
const feeToken = process.env.OMG_FEE_TOKEN
const port = process.env.FEE_RELAYER_PORT || 3333
const spendableToken = process.env.FEE_RELAYER_SPENDABLE_TOKEN

const app = express()
app.use(cors())
app.use(bodyParser.json())

const logger = pino({ level: process.env.LOG_LEVEL || 'info' })
const expressLogger = expressPino({ logger })
app.use(expressLogger)

process
  .on('SIGTERM', shutdown('SIGTERM'))
  .on('SIGINT', shutdown('SIGINT'))
  .on('SIGHUP', shutdown('SIGHUP'))
  .on('SIGQUIT', shutdown('SIGQUIT'))
  .on('unhandledRejection', shutdown('unhandledRejection'))
  .on('uncaughtException', shutdown('uncaughtException'))

function shutdown (signal) {
  return (err) => {
    logger.info(`Shutting down with ${signal}.`)

    process.removeListener('SIGINT', shutdown)
    process.removeListener('SIGHUP', shutdown)
    process.removeListener('SIGQUIT', shutdown)
    process.removeListener('SIGTERM', shutdown)
    process.removeListener('uncaughtException', shutdown)
    process.removeListener('unhandledRejection', shutdown)

    if (err) {
      logger.error(err.stack || err)
    }

    accountSelector.onExit().then(() => {
      process.exit(err ? 1 : 0)
    })
  }
}

createMiddleware('./swagger/swagger.yaml', app, async function (err, middleware) {
  if (err) {
    logger.error(`Error initialising middleware: ${err}`)
    throw err
  }

  await accountSelector.setAccounts(await signer.getAccounts())
  const { address: feePayerAddress } = await accountSelector.getAccount()

  app.use(
    middleware.files(),
    middleware.metadata(),
    middleware.parseRequest(),
    middleware.validateRequest()
  )

  app.get('/', async (req, res) => {
    res.status(200).end()
  })

  app.post('/create-relayed-tx', async (req, res) => {
    try {
      logger.info(`/create-relayed-tx: from ${req.body.utxos[0].owner}, to ${req.body.to}, amount ${req.body.amount}`)
      const tx = await relayTx.create(
        childChain,
        req.body.utxos,
        req.body.amount,
        req.body.metadata,
        spendableToken,
        req.body.to,
        feePayerAddress,
        feeToken
      )
      res.type('application/json')
      res.send(
        JSONBigNumber.stringify({
          success: true,
          data: tx
        }))
    } catch (err) {
      logger.error(err.stack || err)
      res.status(500)
      res.send({
        success: false,
        data: err.toString()
      })
    }
  })

  app.post('/submit-relayed-tx', async (req, res) => {
    try {
      const result = await relayTx.submit(
        childChain,
        req.body.tx,
        req.body.signatures,
        signer.sign
      )
      res.send({
        success: true,
        data: result
      })
    } catch (err) {
      logger.error(err.stack || err)
      res.status(500)
      res.send({
        success: false,
        data: err.toString()
      })
    }
  })

  app.post('/cancel-relayed-tx', async (req, res) => {
    try {
      relayTx.cancel(req.body.tx)
      res.send({
        success: true,
        data: true
      })
    } catch (err) {
      logger.error(err.stack || err)
      res.status(500)
      res.send({
        success: false,
        data: err.toString()
      })
    }
  })

  app.listen(port, () => logger.info(`Fee Relayer running on port ${port}, using account ${feePayerAddress}`))
})
