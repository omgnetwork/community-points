const transaction = require('../../src/transaction')
const BN = require('bn.js')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
const assert = chai.assert

const feeToken = '0x0000000000000000000000000000000000000000'
const spendToken = '0x08g0000000000000000000000000000000000000'
const alice = 'alice'
const bob = 'bob'
const fred = 'fred'

describe('create transaction', () => {
  it('creates a valid tx with no change', async () => {
    const spendAmount = 100
    const utxos = [{
      amount: spendAmount,
      currency: spendToken
    }]

    const feeAmount = 10
    const feeUtxos = [{
      amount: feeAmount,
      currency: feeToken
    }]

    const tx = transaction.create(alice, bob, utxos, spendAmount, spendToken, feeUtxos, feeAmount, fred)
    assert.deepEqual(tx, {
      inputs: [{
        amount: spendAmount,
        currency: spendToken
      }, {
        amount: feeAmount,
        currency: feeToken
      }],
      outputs: [{
        outputType: 1,
        outputGuard: bob,
        currency: spendToken,
        amount: new BN(spendAmount)
      }]
    })
  })

  it('creates a valid tx with spender change', async () => {
    const spendAmount = 100
    const utxos = [{
      amount: spendAmount + 1,
      currency: spendToken
    }]

    const feeAmount = 10
    const feeUtxos = [{
      amount: feeAmount,
      currency: feeToken
    }]

    const tx = transaction.create(alice, bob, utxos, spendAmount, spendToken, feeUtxos, feeAmount, fred)
    assert.deepEqual(tx, {
      inputs: [{
        amount: utxos[0].amount,
        currency: spendToken
      }, {
        amount: feeUtxos[0].amount,
        currency: feeToken
      }],
      outputs: [{
        outputType: 1,
        outputGuard: bob,
        currency: spendToken,
        amount: new BN(spendAmount)
      }, {
        outputType: 1,
        outputGuard: alice,
        currency: spendToken,
        amount: new BN(1)
      }]
    })
  })

  it('creates a valid tx with spender change and fee change', async () => {
    const spendAmount = 100
    const utxos = [{
      amount: spendAmount + 1,
      currency: spendToken
    }]

    const feeAmount = 10
    const feeUtxos = [{
      amount: feeAmount + 1,
      currency: feeToken
    }]

    const tx = transaction.create(alice, bob, utxos, spendAmount, spendToken, feeUtxos, feeAmount, fred)
    assert.deepEqual(tx, {
      inputs: [{
        amount: utxos[0].amount,
        currency: spendToken
      }, {
        amount: feeUtxos[0].amount,
        currency: feeToken
      }],
      outputs: [{
        outputType: 1,
        outputGuard: bob,
        currency: spendToken,
        amount: new BN(spendAmount)
      }, {
        outputType: 1,
        outputGuard: alice,
        currency: spendToken,
        amount: new BN(1)
      }, {
        outputType: 1,
        outputGuard: fred,
        currency: feeToken,
        amount: new BN(1)
      }]
    })
  })

  it('creates a valid tx with multiple spender utxos', async () => {
    const spendAmount = 100
    const utxos = [{
      amount: spendAmount,
      currency: spendToken
    }, {
      amount: spendAmount,
      currency: spendToken
    }]

    const expectedSpenderChange = utxos[0].amount + utxos[1].amount - spendAmount

    const feeAmount = 10
    const feeUtxos = [{
      amount: feeAmount + 1,
      currency: feeToken
    }]

    const tx = transaction.create(alice, bob, utxos, spendAmount, spendToken, feeUtxos, feeAmount, fred)
    assert.deepEqual(tx, {
      inputs: [{
        amount: utxos[0].amount,
        currency: spendToken
      }, {
        amount: utxos[1].amount,
        currency: spendToken
      }, {
        amount: feeUtxos[0].amount,
        currency: feeToken
      }],
      outputs: [{
        outputType: 1,
        outputGuard: bob,
        currency: spendToken,
        amount: new BN(spendAmount)
      }, {
        outputType: 1,
        outputGuard: alice,
        currency: spendToken,
        amount: new BN(expectedSpenderChange)
      }, {
        outputType: 1,
        outputGuard: fred,
        currency: feeToken,
        amount: new BN(1)
      }]
    })
  })

  it('creates a valid tx with multiple spender and fee utxos', async () => {
    const spendAmount = 100
    const utxos = [{
      amount: spendAmount,
      currency: spendToken
    }, {
      amount: spendAmount,
      currency: spendToken
    }]

    const expectedSpenderChange = utxos[0].amount + utxos[1].amount - spendAmount

    const feeAmount = 10
    const feeUtxos = [{
      amount: feeAmount,
      currency: feeToken
    }, {
      amount: feeAmount,
      currency: feeToken
    }]

    const expectedFeeChange = feeUtxos[0].amount + feeUtxos[1].amount - feeAmount

    const tx = transaction.create(alice, bob, utxos, spendAmount, spendToken, feeUtxos, feeAmount, fred)
    assert.deepEqual(tx, {
      inputs: [{
        amount: utxos[0].amount,
        currency: spendToken
      }, {
        amount: utxos[1].amount,
        currency: spendToken
      }, {
        amount: feeUtxos[0].amount,
        currency: feeToken
      }, {
        amount: feeUtxos[1].amount,
        currency: feeToken
      }],
      outputs: [{
        outputType: 1,
        outputGuard: bob,
        currency: spendToken,
        amount: new BN(spendAmount)
      }, {
        outputType: 1,
        outputGuard: alice,
        currency: spendToken,
        amount: new BN(expectedSpenderChange)
      }, {
        outputType: 1,
        outputGuard: fred,
        currency: feeToken,
        amount: new BN(expectedFeeChange)
      }]
    })
  })

  it('creates a valid tx with multiple spender and fee utxos and BN numbers', async () => {
    const spendAmount = new BN(10).pow(new BN(18))
    const utxos = [{
      amount: spendAmount,
      currency: spendToken
    }, {
      amount: spendAmount,
      currency: spendToken
    }]
    const expectedSpenderChange = utxos[0].amount.add(utxos[1].amount).sub(spendAmount)

    const feeAmount = new BN(10).pow(new BN(15))
    const feeUtxos = [{
      amount: feeAmount,
      currency: feeToken
    }, {
      amount: feeAmount,
      currency: feeToken
    }]
    const expectedFeeChange = feeUtxos[0].amount.add(feeUtxos[1].amount).sub(feeAmount)

    const tx = transaction.create(alice, bob, utxos, spendAmount, spendToken, feeUtxos, feeAmount, fred)
    assert.deepEqual(tx, {
      inputs: [{
        amount: utxos[0].amount,
        currency: spendToken
      }, {
        amount: utxos[1].amount,
        currency: spendToken
      }, {
        amount: feeUtxos[0].amount,
        currency: feeToken
      }, {
        amount: feeUtxos[1].amount,
        currency: feeToken
      }],
      outputs: [{
        outputType: 1,
        outputGuard: bob,
        currency: spendToken,
        amount: new BN(spendAmount)
      }, {
        outputType: 1,
        outputGuard: alice,
        currency: spendToken,
        amount: new BN(expectedSpenderChange)
      }, {
        outputType: 1,
        outputGuard: fred,
        currency: feeToken,
        amount: new BN(expectedFeeChange)
      }]
    })
  })
})

describe('create transaction failures', () => {
  it('throws an error when there are no inputs', async () => {
    const spendAmount = 100
    const utxos = []

    const feeAmount = 10
    const feeUtxos = [{
      amount: feeAmount,
      currency: feeToken
    }]

    assert.throws(
      () => transaction.create(alice, bob, utxos, spendAmount, spendToken, feeUtxos, feeAmount, fred),
      'spendUtxos is empty'
    )
  })

  it('throws an error when there are no fee inputs', async () => {
    const spendAmount = 100
    const utxos = [{
      amount: spendAmount,
      currency: spendToken
    }]

    const feeAmount = 10
    const feeUtxos = []

    assert.throws(
      () => transaction.create(alice, bob, utxos, spendAmount, spendToken, feeUtxos, feeAmount, fred),
      'feeUtxos is empty'
    )
  })

  it('throws an error when insufficient funds', async () => {
    const spendAmount = 100
    const utxos = [{
      amount: spendAmount - 1,
      currency: spendToken
    }]

    const feeAmount = 10
    const feeUtxos = [{
      amount: feeAmount,
      currency: feeToken
    }]

    assert.throws(
      () => transaction.create(alice, bob, utxos, spendAmount, spendToken, feeUtxos, feeAmount, fred),
      'Insufficient inputs to cover amount'
    )
  })

  it('throws an error when insufficient fee', async () => {
    const spendAmount = 100
    const utxos = [{
      amount: spendAmount,
      currency: spendToken
    }]

    const feeAmount = 10
    const feeUtxos = [{
      amount: feeAmount - 1,
      currency: feeToken
    }]

    assert.throws(
      () => transaction.create(alice, bob, utxos, spendAmount, spendToken, feeUtxos, feeAmount, fred),
      'Insufficient fee inputs to cover fee'
    )
  })
})
