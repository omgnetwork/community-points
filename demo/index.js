const {
  approveErc20,
  depositEth,
  depositErc20,
  getPointBalance,
  getChildChainBalance,
  Logger,
  mint,
  wait
} = require('./utils/helpers')

const {
  distributor,
  KarmaPointsContract: KRP,
  CommunityPointsContract: RCP,
  provider,
  rootchain,
  childchain
} = require('./utils/config')

const { currency } = require('./utils/constants')

const executeClaimFlow = async () => {
  Logger.logContractAddress('Karma Points', KRP._address)

  balance = await getPointBalance(KRP, distributor.address)
  Logger.logBalance('Distributor', 'KRP', 'Ethereum Network', balance)

  Logger.logMinting('Distributor', 100, 'KRP')

  let receipt = await mint(provider, KRP, distributor, distributor, 100)
  Logger.logTransactionHash(receipt.transactionHash)

  balance = await getPointBalance(KRP, distributor.address)

  Logger.logBalance('Distributor', 'KRP', 'Ethereum Network', balance)

  Logger.logContractAddress('Community Points', RCP._address)

  balance = await getPointBalance(RCP, distributor.address)
  Logger.logBalance('Distributor', 'RCP', 'Ethereum Network', balance)

  Logger.logMinting('Distributor', 100, 'RCP')

  receipt = await mint(provider, RCP, distributor, distributor, 100)
  Logger.logTransactionHash(receipt.transactionHash)

  balance = await getPointBalance(RCP, distributor.address)
  Logger.logBalance('Distributor', 'RCP', 'Ethereum Network', balance)

  balance = await getChildChainBalance(
    childchain,
    distributor.address,
    currency.ETH
  )
  Logger.logBalance('Distributor', 'ETH', 'OMG Network', balance)

  receipt = await depositEth(rootchain, provider, distributor, '0.01')

  balance = await getChildChainBalance(
    childchain,
    distributor.address,
    currency.ETH
  )
  Logger.logBalance('Distributor', 'ETH', 'OMG Network', balance)

  Logger.logApprovingErc20('KRP', '100')
  receipt = await approveErc20(rootchain, KRP._address, distributor, 100)
  Logger.logTransactionHash(receipt.transactionHash)

  Logger.logApprovingErc20('RCP', 100)
  receipt = await approveErc20(rootchain, RCP._address, distributor, 100)
  Logger.logTransactionHash(receipt.transactionHash)

  balance = await getChildChainBalance(
    childchain,
    distributor.address,
    currency.KRP
  )
  Logger.logBalance('Distributor', 'KRP', 'OMG Network', balance)

  receipt = await depositErc20(
    rootchain,
    provider,
    distributor,
    '100',
    currency.KRP,
    'KRP'
  )

  balance = await getChildChainBalance(
    childchain,
    distributor.address,
    currency.KRP
  )
  Logger.logBalance('Distributor', 'KRP', 'OMG Network', balance)

  balance = await getChildChainBalance(
    childchain,
    distributor.address,
    currency.RCP
  )
  Logger.logBalance('Distributor', 'RCP', 'OMG Network', balance)

  receipt = await depositErc20(
    rootchain,
    provider,
    distributor,
    '100',
    currency.RCP,
    'RCP'
  )

  balance = await getChildChainBalance(
    childchain,
    distributor.address,
    currency.RCP
  )
  Logger.logBalance('Distributor', 'RCP', 'OMG Network', balance)
}

executeClaimFlow()
