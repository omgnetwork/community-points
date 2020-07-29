const { OmgUtil } = require('@omisego/omg-js')

const { Accounts, Contracts, Clients } = require('./src/config')
const ChildChain = require('./src/childchain')
const RootChain = require('./src/rootchain')
const Logger = require('./src/util/logger')

const { KARMA, RCP } = Contracts
const { Alice, Distributor, SubRedditServer } = Accounts

const executeClaimFlow = async () => {
  Logger.logContractAddress(KARMA.symbol, KARMA._address)

  balance = await RootChain.getBalance(KARMA, Distributor.address)
  Logger.logBalance(Distributor.name, KARMA.symbol, 'Ethereum Network', balance)

  Logger.logMinting(Distributor.name, 100, KARMA.symbol)

  let receipt = await RootChain.callMint(
    KARMA,
    Distributor,
    Distributor,
    100,
    Clients.Ethereum.Provider
  )
  Logger.logTransactionHash(receipt.transactionHash)

  balance = await RootChain.getBalance(KARMA, Distributor.address)

  Logger.logBalance(Distributor.name, KARMA.symbol, 'Ethereum Network', balance)

  Logger.logContractAddress(RCP.symbol, RCP._address)

  balance = await RootChain.getBalance(RCP, Distributor.address)
  Logger.logBalance(Distributor.name, RCP.symbol, 'Ethereum Network', balance)

  Logger.logMinting(Distributor.name, 100, RCP.symbol)

  receipt = await RootChain.callMint(
    RCP,
    Distributor,
    Distributor,
    100,
    Clients.Ethereum.Provider
  )
  Logger.logTransactionHash(receipt.transactionHash)

  balance = await RootChain.getBalance(RCP, Distributor.address)
  Logger.logBalance(Distributor.name, RCP.symbol, 'Ethereum Network', balance)

  balance = await ChildChain.getBalance(
    Distributor.address,
    OmgUtil.transaction.ETH_CURRENCY
  )

  Logger.logBalance(Distributor.name, 'ETH', 'OMG Network', balance)

  receipt = await RootChain.depositEth(
    Distributor,
    '0.01',
    Clients.Ethereum.Provider,
    Clients.Plasma.RootChain
  )

  balance = await ChildChain.getBalance(
    Distributor.address,
    OmgUtil.transaction.ETH_CURRENCY
  )
  Logger.logBalance(Distributor.name, 'ETH', 'OMG Network', balance)

  Logger.logApprovingErc20(KARMA.symbol, '100')
  receipt = await RootChain.approveErc20(
    KARMA._address,
    Distributor,
    100,
    Clients.Plasma.RootChain
  )
  Logger.logTransactionHash(receipt.transactionHash)

  Logger.logApprovingErc20(RCP.symbol, 100)
  receipt = await RootChain.approveErc20(
    RCP._address,
    Distributor,
    100,
    Clients.Plasma.RootChain
  )
  Logger.logTransactionHash(receipt.transactionHash)

  balance = await ChildChain.getBalance(Distributor.address, KARMA._address)
  Logger.logBalance(Distributor.name, KARMA.symbol, 'OMG Network', balance)

  receipt = await RootChain.depositErc20(
    Distributor,
    '100',
    KARMA,
    Clients.Plasma.RootChain,
    Clients.Ethereum.Provider
  )

  balance = await ChildChain.getBalance(Distributor.address, KARMA._address)
  Logger.logBalance(Distributor.name, KARMA.symbol, 'OMG Network', balance)

  balance = await ChildChain.getBalance(Distributor.address, RCP._address)
  Logger.logBalance(Distributor.name, RCP.symbol, 'OMG Network', balance)

  receipt = await RootChain.depositErc20(
    Distributor,
    '100',
    RCP,
    Clients.Plasma.RootChain,
    Clients.Ethereum.Provider
  )

  balance = await ChildChain.getBalance(Distributor.address, RCP._address)
  Logger.logBalance(Distributor.name, RCP.symbol, 'OMG Network', balance)

  balance = await ChildChain.getBalance(Alice.address, KARMA._address)
  Logger.logBalance(Alice.name, KARMA.symbol, 'OMG Network', balance)

  Logger.logTransfering(Distributor.name, Alice.name, '100', KARMA.symbol)
  receipt = await ChildChain.transfer(Distributor, Alice, '100', KARMA._address)
  Logger.logTransactionHash(receipt.txhash)

  Logger.logWaitingForWatcher()
  await ChildChain.waitForTransfer(
    Alice.address,
    balance,
    '100',
    KARMA._address
  )

  balance = await ChildChain.getBalance(Alice.address, KARMA._address)
  Logger.logBalance(Alice.name, KARMA.symbol, 'OMG Network', balance)

  balance = await ChildChain.getBalance(SubRedditServer.address, RCP._address)
  Logger.logBalance(SubRedditServer.name, RCP.symbol, 'OMG Network', balance)

  Logger.logTransfering(
    Distributor.name,
    SubRedditServer.name,
    '100',
    RCP.symbol
  )
  receipt = await ChildChain.transfer(
    Distributor,
    SubRedditServer,
    '100',
    RCP._address
  )
  Logger.logTransactionHash(receipt.txhash)

  Logger.logWaitingForWatcher()
  await ChildChain.waitForTransfer(
    SubRedditServer.address,
    balance,
    '100',
    RCP._address
  )

  balance = await ChildChain.getBalance(SubRedditServer.address, RCP._address)
  Logger.logBalance(SubRedditServer.name, RCP.symbol, 'OMG Network', balance)
}

executeClaimFlow()
