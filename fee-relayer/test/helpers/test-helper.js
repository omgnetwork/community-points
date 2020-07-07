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
const { transaction, hexPrefix } = require('@omisego/omg-js-util')
const BN = require('bn.js')

async function selectUtxos (childChain, utxos, amount, currency, feeCurrency) {
  const fees = (await childChain.getFees())['1']
  const { amount: feeEthAmountWei } = fees.find(f => f.currency === feeCurrency)

  // Filter by desired currency and sort in descending order
  const sorted = utxos
    .filter(utxo => utxo.currency.toLowerCase() === currency.toLowerCase())
    .sort((a, b) => new BN(b.amount).sub(new BN(a.amount)))

  if (sorted) {
    const selected = []
    const currentBalance = new BN(0)
    for (let i = 0; i < Math.min(sorted.length, 4); i++) {
      selected.push(sorted[i])
      currentBalance.iadd(new BN(sorted[i].amount))
      const expectedTotalIncludeFee = new BN(amount).add(new BN(feeEthAmountWei))
      if (currency === feeCurrency && currentBalance.gte(expectedTotalIncludeFee)) {
        break
      } else if (currentBalance.gte(new BN(amount))) {
        break
      }
    }
    if (currency !== feeCurrency) {
      const ethUtxos = utxos.find(
        utxo => utxo.currency.toLowerCase() === feeCurrency.toLowerCase()
      )
      selected.push(ethUtxos)
    }
    return selected
  }
}

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

async function sendAndWait (childChain, from, to, amount, currency, feeCurrency, privateKey, expectedBalance, verifyingContract) {
  const ret = await send(childChain, from, to, amount, currency, feeCurrency, privateKey, verifyingContract)
  const expectedBn = new BN(expectedBalance)
  await waitForBalance(childChain, to, currency, balance => new BN(balance.amount).eq(expectedBn))
  return ret
}

async function createTx (childChain, from, to, amount, currency, feeCurrency, fromPrivateKey, verifyingContract) {
  if (amount <= 0) {
    return
  }

  const utxos = await childChain.getUtxos(from)
  const utxosToSpend = await selectUtxos(childChain, utxos, amount, currency, feeCurrency, true)
  if (!utxosToSpend || utxosToSpend.length === 0) {
    throw new Error(`Not enough funds in ${from} to cover ${amount} ${currency}`)
  }

  // Construct the tx body
  const txBody = {
    inputs: utxosToSpend,
    outputs: [{
      outputType: 1,
      outputGuard: to,
      currency,
      amount
    }]
  }

  const fees = (await childChain.getFees())['1']
  const { amount: feeAmount } = fees.find(f => f.currency.toLowerCase() === feeCurrency.toLowerCase())

  const utxoAmount = new BN(utxosToSpend.find(utxo => utxo.currency.toLowerCase() === currency.toLowerCase()).amount)
  const feeUtxoAmount = new BN(utxosToSpend.find(utxo => utxo.currency.toLowerCase() === feeCurrency.toLowerCase()).amount)
  const isFeeCurrency = currency.toLowerCase() === feeCurrency.toLowerCase()

  if (!isFeeCurrency) {
    // Need to add a 'change' output
    if (utxoAmount.gt(new BN(amount))) {
      const CHANGE_AMOUNT = utxoAmount.sub(new BN(amount))
      txBody.outputs.push({
        outputType: 1,
        outputGuard: from,
        currency,
        amount: CHANGE_AMOUNT
      })
    }

    const CHANGE_AMOUNT_FEE = feeUtxoAmount.sub(new BN(feeAmount))

    txBody.outputs.push({
      outputType: 1,
      outputGuard: from,
      currency: feeCurrency,
      amount: CHANGE_AMOUNT_FEE
    })
  } else {
    const totalDeduct = new BN(amount).add(new BN(feeAmount))
    if (utxoAmount.gt(totalDeduct)) {
      const CHANGE_AMOUNT = utxoAmount.sub(new BN(amount)).sub(new BN(feeAmount))
      txBody.outputs.push({
        outputType: 1,
        outputGuard: from,
        currency,
        amount: CHANGE_AMOUNT
      })
    }
  }

  const privateKeys = new Array(utxosToSpend.length).fill(fromPrivateKey)
  const typedData = transaction.getTypedData(txBody, verifyingContract)
  const signatures = childChain.signTransaction(typedData, privateKeys)

  return childChain.buildSignedTransaction(typedData, signatures)
}

async function send (childChain, from, to, amount, currency, feeCurrency, fromPrivateKey, verifyingContract) {
  const signedTx = await createTx(childChain, from, to, amount, currency, feeCurrency, fromPrivateKey, verifyingContract)
  const result = await childChain.submitTransaction(signedTx)
  return { result, txbytes: hexPrefix(signedTx) }
}

module.exports = {
  waitForBalance,
  send,
  createTx,
  sendAndWait,
  selectUtxos
}
