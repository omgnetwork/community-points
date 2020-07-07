const utxoManager = require('../../src/utxo-manager')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
const assert = chai.assert

const feeToken = '0x0000000000000000000000000000000000000000'
const notFeeToken = '0xdeadfee000000000000000000000000000000000'

describe('getFeeUtxo', () => {
  it('throws error if no utxo', async () => {
    const feeAmount = 1
    assert.isRejected(utxoManager.getFeeUtxo([], feeToken, feeAmount),
      `Insufficient funds to cover fee amount ${feeAmount}`)
  })

  it('throws error if no utxo is large enough', async () => {
    const utxos = [{
      amount: '99',
      currency: feeToken
    }]
    const feeAmount = 100

    assert.isRejected(utxoManager.getFeeUtxo(utxos, feeToken, feeAmount), `Insufficient funds to cover fee amount ${feeAmount}`)
  })

  it('throws error if no fee token utxo is large enough', async () => {
    const utxos = [{
      amount: '99',
      currency: feeToken
    }, {
      amount: '100',
      currency: notFeeToken
    }]
    const feeAmount = 100

    assert.isRejected(utxoManager.getFeeUtxo(utxos, feeToken, feeAmount)
      , `Insufficient funds to cover fee amount ${feeAmount}`)
  })

  it('returns the only fee utxo', async () => {
    const utxos = [{
      amount: '100',
      currency: feeToken
    }]

    const feeAmount = 100

    const utxo = await utxoManager.getFeeUtxo(utxos, feeToken, feeAmount)
    assert(utxo === utxos[0])
  })

  it('returns a matching fee utxo', async () => {
    const utxos = [{
      amount: '1',
      currency: feeToken
    }, {
      amount: '99',
      currency: feeToken
    }, {
      amount: '100',
      currency: feeToken
    }]

    const feeAmount = 100

    const utxo = await utxoManager.getFeeUtxo(utxos, feeToken, feeAmount)
    assert(utxo === utxos[2])
  })

  it('returns a matching fee utxo if there are other token utxos', async () => {
    const utxos = [{
      amount: '100',
      currency: notFeeToken
    }, {
      amount: '100',
      currency: feeToken
    }]

    const feeAmount = 100

    const utxo = await utxoManager.getFeeUtxo(utxos, feeToken, feeAmount)
    assert(utxo === utxos[1])
  })

  it('does not return a pending utxo', async () => {
    const utxos = [{
      amount: '100',
      currency: feeToken
    }]

    const feeAmount = 100

    const utxo = await utxoManager.getFeeUtxo(utxos, feeToken, feeAmount)
    assert(utxo === utxos[0])

    assert.isRejected(utxoManager.getFeeUtxo(utxos, feeToken, feeAmount), `Insufficient funds to cover fee amount ${feeAmount}`)
  })
})
