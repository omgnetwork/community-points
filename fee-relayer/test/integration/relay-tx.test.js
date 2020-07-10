require('dotenv').config()
const relayTx = require('../../src/relay-tx')
const helper = require('../helpers/test-helper')
const { RootChain, ChildChain } = require('@omisego/omg-js')
const Web3 = require('web3')
const BN = require('bn.js')
const ethUtil = require('ethereumjs-util')
const sigUtil = require('eth-sig-util')

const feeToken = process.env.OMG_FEE_TOKEN
// const feePayerAddress = process.env.FEE_RELAYER_ADDRESS
const spendToken = process.env.TEST_SPEND_TOKEN
const faucetAddress = process.env.TEST_FAUCET_ADDRESS
const faucetPrivateKey = process.env.TEST_FAUCET_PK

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.TEST_ETH_NODE), null, { transactionConfirmationBlocks: 1 })
const rootChain = new RootChain({ web3, plasmaContractAddress: process.env.OMG_PLASMA_CONTRACT })
const childChain = new ChildChain({
  watcherUrl: process.env.OMG_WATCHER_URL,
  plasmaContractAddress: process.env.OMG_PLASMA_CONTRACT
})

const ETH = '0x0000000000000000000000000000000000000000'

async function initFaucet () {
  // Init the faucet
  // Deposit fee token
  const FAUCET_FEE_TOPUP = new BN(6000000000000000).muln(20)
  const FAUCET_SPEND_TOPUP = 100

  if (feeToken !== ETH) {
    await rootChain.approveToken({
      erc20Address: feeToken,
      amount: FAUCET_FEE_TOPUP,
      txOptions: {
        from: faucetAddress,
        privateKey: faucetPrivateKey
      }
    })
  }
  await rootChain.deposit({
    amount: FAUCET_FEE_TOPUP,
    currency: feeToken,
    txOptions: {
      from: faucetAddress,
      privateKey: faucetPrivateKey
    }
  })

  // Deposit spend token
  await rootChain.approveToken({
    erc20Address: spendToken,
    amount: FAUCET_SPEND_TOPUP,
    txOptions: {
      from: faucetAddress,
      privateKey: faucetPrivateKey
    }
  })
  await rootChain.deposit({
    amount: FAUCET_SPEND_TOPUP,
    currency: spendToken,
    txOptions: {
      from: faucetAddress,
      privateKey: faucetPrivateKey
    }
  })

  await helper.waitForBalance(
    childChain,
    faucetAddress,
    feeToken,
    balance => new BN(balance.amount).gte(new BN(FAUCET_FEE_TOPUP))
  )
  await helper.waitForBalance(
    childChain,
    faucetAddress,
    spendToken,
    balance => new BN(balance.amount).gte(new BN(FAUCET_SPEND_TOPUP))
  )
}

describe('relay-tx integration test', () => {
  before(async () => {
    await initFaucet()

    // create and fund feepayer account with fee token
    this.feeRelayer = web3.eth.accounts.create()
    const feeAmount = new BN(6000000000000000).muln(2)
    await helper.sendAndWait(
      childChain,
      faucetAddress,
      this.feeRelayer.address,
      feeAmount,
      feeToken,
      feeToken,
      faucetPrivateKey,
      feeAmount
    )

    // create and fund alice account with spend token
    this.alice = web3.eth.accounts.create()
    await helper.sendAndWait(
      childChain,
      faucetAddress,
      this.alice.address,
      10,
      spendToken,
      feeToken,
      faucetPrivateKey,
      10
    )

    // create bob account
    this.bob = web3.eth.accounts.create()

    this.signFunc = async (toSign) => {
      const signed = ethUtil.ecsign(
        toSign,
        Buffer.from(this.feeRelayer.privateKey.replace('0x', ''), 'hex')
      )
      return sigUtil.concatSig(signed.v, signed.r, signed.s)
    }
  })

  it('send a relay tx', async () => {
    // Get alice's utxo
    const aliceUtxos = await childChain.getUtxos(this.alice.address)

    const TEST_AMOUNT = 4

    // Call relayTx.create()
    const tx = await relayTx.create(
      childChain,
      aliceUtxos,
      TEST_AMOUNT,
      spendToken,
      this.bob.address,
      this.feeRelayer.address,
      feeToken
    )

    // Sign with alice's key
    const signatures = childChain.signTransaction(tx.typedData, [this.alice.privateKey])

    // call relayTx.submit()
    await relayTx.submit(childChain, tx.typedData, signatures, this.signFunc)

    // Check that the transaction succeeded
    return helper.waitForBalance(childChain, this.bob.address, spendToken, balance => new BN(balance.amount).eqn(TEST_AMOUNT))
  })
})
