const relayTx = require('../../src/relay-tx')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
const assert = chai.assert

const feeToken = '0x0000000000000000000000000000000000000000'
const feeAmount = 12345677890123456
const spendableToken = '0x1234567000000000000000000000000000000000'
const notSpendableToken = '0x9999999000000000000000000000000000000000'

describe('validate', () => {
  it('throws error if no inputs', async () => {
    const tx = {
      inputs: [],
      outputs: []
    }
    const sigs = []
    const spendableTokens = []
    const feeInfo = {}

    assert.throws(
      () => relayTx.validate(tx, sigs, spendableTokens, feeInfo),
      'Incorrect number of transaction inputs'
    )
  })

  it('throws error if no outputs', async () => {
    const tx = {
      inputs: [{}, {}],
      outputs: []
    }
    const sigs = []
    const spendableTokens = []
    const feeInfo = {}

    assert.throws(
      () => relayTx.validate(tx, sigs, spendableTokens, feeInfo),
      'Incorrect number of transaction outputs'
    )
  })

  it('throws error if only one input', async () => {
    const tx = {
      inputs: [{}],
      outputs: []
    }
    const sigs = []
    const spendableTokens = []
    const feeInfo = {}

    assert.throws(
      () => relayTx.validate(tx, sigs, spendableTokens, feeInfo),
      'Incorrect number of transaction inputs'
    )
  })

  it('throws error if tries to spend a non spendable token', async () => {
    const tx = {
      inputs: [
        { currency: notSpendableToken, amount: 10 },
        { currency: feeToken, amount: feeAmount }
      ],
      outputs: [{ currency: notSpendableToken, amount: 10 }]
    }
    const sigs = []
    const spendableTokens = [spendableToken]
    const feeInfo = { currency: feeToken, amount: feeAmount }

    assert.throws(
      () => relayTx.validate(tx, sigs, spendableTokens, feeInfo),
      'Unsupported input token'
    )
  })

  it('throws error if the user tries to spend a fee token', async () => {
    const tx = {
      inputs: [
        { currency: feeToken, amount: 10 },
        { currency: feeToken, amount: feeAmount }
      ],
      outputs: [{ currency: feeToken, amount: 10 }]
    }
    const sigs = []
    const spendableTokens = [spendableToken]
    const feeInfo = { currency: feeToken, amount: feeAmount }

    assert.throws(
      () => relayTx.validate(tx, sigs, spendableTokens, feeInfo),
      'Unsupported input token'
    )
  })

  it('throws error if there is no fee input', async () => {
    const tx = {
      inputs: [
        { currency: spendableToken, amount: 5 },
        { currency: spendableToken, amount: 5 }
      ],
      outputs: [{ currency: spendableToken, amount: 10 }]
    }
    const sigs = ['', '']
    const spendableTokens = [spendableToken]
    const feeInfo = { currency: feeToken, amount: feeAmount }

    assert.throws(
      () => relayTx.validate(tx, sigs, spendableTokens, feeInfo),
      'No fee input'
    )
  })

  it('throws error if user tries to make fee payer spend extra fee token', async () => {
    const tx = {
      inputs: [
        { owner: 'spender', currency: spendableToken, amount: 10 },
        { owner: 'fee payer', currency: feeToken, amount: feeAmount * 2 }
      ],
      outputs: [
        { owner: 'spender', currency: spendableToken, amount: 10 },
        { owner: 'spender', currency: feeToken, amount: feeAmount }
      ]
    }
    const sigs = ['']
    const spendableTokens = [spendableToken]
    const feeInfo = { currency: feeToken, amount: feeAmount }

    assert.throws(
      () => relayTx.validate(tx, sigs, spendableTokens, feeInfo),
      'Incorrect fee'
    )
  })
})
