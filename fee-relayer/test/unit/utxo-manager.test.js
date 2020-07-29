const utxoManager = require('../../src/utxo-manager')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const sinon = require('sinon')

chai.use(chaiAsPromised)
const assert = chai.assert

const feeToken = '0x0000000000000000000000000000000000000000'

describe('getFeeUtxo', () => {
  beforeEach(async () => {
    this.stubGetUtxos = sinon.stub(utxoManager, 'getUtxos')
    return utxoManager.cleanPending([])
  })

  afterEach(() => {
    this.stubGetUtxos.restore()
  })

  it('throws error if no utxo', async () => {
    const feeAmount = 1
    this.stubGetUtxos.returns([])
    return assert.isRejected(utxoManager.getFeeUtxo(null, '', feeToken, feeAmount),
      `Insufficient funds to cover fee amount ${feeAmount}`)
  })

  it('throws error if no utxo is large enough', async () => {
    const utxos = [{
      amount: '99',
      currency: feeToken
    }]
    const feeAmount = 100

    this.stubGetUtxos.returns(utxos)
    return assert.isRejected(utxoManager.getFeeUtxo(null, '', feeToken, feeAmount), `Insufficient funds to cover fee amount ${feeAmount}`)
  })

  it('throws error if no fee token utxo is large enough', async () => {
    const utxos = [{
      amount: '99',
      currency: feeToken
    }]
    const feeAmount = 100

    this.stubGetUtxos.returns(utxos)
    return assert.isRejected(utxoManager.getFeeUtxo(null, '', feeToken, feeAmount)
      , `Insufficient funds to cover fee amount ${feeAmount}`)
  })

  it('returns the only fee utxo', async () => {
    const utxos = [{
      amount: '100',
      currency: feeToken
    }]

    const feeAmount = 100

    this.stubGetUtxos.returns(utxos)
    const utxo = await utxoManager.getFeeUtxo(null, '', feeToken, feeAmount)
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

    this.stubGetUtxos.returns(utxos)
    const utxo = await utxoManager.getFeeUtxo(null, '', feeToken, feeAmount)
    assert(utxo === utxos[2])
  })

  it('does not return a pending utxo', async () => {
    const utxos = [{
      amount: '100',
      currency: feeToken
    }]

    const feeAmount = 100

    this.stubGetUtxos.returns(utxos)
    const utxo = await utxoManager.getFeeUtxo(null, '', feeToken, feeAmount)
    assert(utxo === utxos[0])

    return assert.isRejected(utxoManager.getFeeUtxo(null, '', feeToken, feeAmount), `Insufficient funds to cover fee amount ${feeAmount}`)
  })

  it('uses a previously pending utxo again', async () => {
    const utxos = [{
      amount: '100',
      currency: feeToken,
      blknum: 359000,
      txindex: 123,
      oindex: 2
    }]

    const feeAmount = 100

    this.stubGetUtxos.returns(utxos)
    const utxo = await utxoManager.getFeeUtxo(null, '', feeToken, feeAmount)
    assert(utxo === utxos[0])

    await assert.isRejected(utxoManager.getFeeUtxo(null, '', feeToken, feeAmount), `Insufficient funds to cover fee amount ${feeAmount}`)

    await utxoManager.cancelPending(utxo)
    const newUtxo = await utxoManager.getFeeUtxo(null, '', feeToken, feeAmount)
    assert(newUtxo === utxos[0])
  })
})
