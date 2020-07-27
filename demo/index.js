const pino = require('pino')({ prettyPrint: true })
const { getPointBalance, Logger, mint } = require('./utils/helpers')

const {
  Distributor,
  KarmaPointsContract: KRP,
  CommunityPointsContract: RCP,
  Provider
} = require('./utils/config')

const executeClaimFlow = async () => {
  Logger.logContractAddress('Karma Points', KRP._address)

  let balance = await getPointBalance(KRP, Distributor.address)
  Logger.logBalance('Distributor', 'KRP', 'Ethereum Network', balance)

  Logger.logMinting('Distributor', 100, 'KRP')

  let receipt = await mint(Provider, KRP, Distributor, Distributor, 100)
  Logger.logTransactionHash(receipt.transactionHash)

  balance = await getPointBalance(KRP, Distributor.address)
  Logger.logBalance('Distributor', 'KRP', 'Ethereum Network', balance)

  Logger.logContractAddress('Community Points', RCP._address)

  balance = await getPointBalance(RCP, Distributor.address)
  Logger.logBalance('Distributor', 'RCP', 'Ethereum Network', balance)

  Logger.logMinting('Distributor', 100, 'RCP')

  receipt = await mint(Provider, RCP, Distributor, Distributor, 100)
  Logger.logTransactionHash(receipt.transactionHash)

  balance = await getPointBalance(RCP, Distributor.address)
  Logger.logBalance('Distributor', 'RCP', 'Ethereum Network', balance)
}

executeClaimFlow()
