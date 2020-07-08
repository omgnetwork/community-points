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
limitations under the License. */

const promiseRetry = require('promise-retry')
const { transaction } = require('@omisego/omg-js-util')
const BN = require('bn.js')

function waitForBalance (childChain, address, currency, callback) {
  return promiseRetry(async (retry, number) => {
    console.log(`Waiting for childchain balance...  (${number})`)
    const resp = await childChain.getBalance(address)
    if (resp.length === 0) retry()
    const currencyExists = resp.find(item => item.currency.toLowerCase() === currency.toLowerCase())
    if (!currencyExists) retry()

    if (callback) {
      const callbackPassed = callback(currencyExists)
      if (!callbackPassed) retry()
    }

    return resp
  }, {
    minTimeout: 6000,
    factor: 1,
    retries: 50
  })
}

async function send ({ childChain, from, fromPK, to, amount, currency, feeCurrency }) {
  const transferAmount = new BN(amount)

  const payments = [{
    owner: to,
    currency,
    amount: transferAmount
  }]

  const createdTxn = await childChain.createTransaction({
    owner: from,
    payments,
    fee: { currency: feeCurrency },
    metadata: 'Happy Birthday Kasima'
  })

  // type/sign/build/submit
  const typedData = transaction.getTypedData(createdTxn.transactions[0], childChain.plasmaContractAddress)
  const privateKeys = new Array(createdTxn.transactions[0].inputs.length).fill(fromPK)
  const signatures = childChain.signTransaction(typedData, privateKeys)
  const signedTxn = childChain.buildSignedTransaction(typedData, signatures)
  return childChain.submitTransaction(signedTxn)
}

async function sendAndWait (childChain, from, to, amount, currency, feeCurrency, fromPK, expectedBalance) {
  const ret = await send({ childChain, from, fromPK, to, amount, currency, feeCurrency })
  const expectedBn = new BN(expectedBalance)
  await waitForBalance(childChain, to, currency, balance => new BN(balance.amount).eq(expectedBn))
  return ret
}

module.exports = {
  waitForBalance,
  sendAndWait,
  send
}
