require('dotenv').config()

const { getAccount, getProvider, getContract } = require('./helpers')

const { abi: KRP } = require('../build/contracts/KarmaPoint.json')
const { abi: RCP } = require('../build/contracts/RedditCommunityPoint.json')

const {
  DISTRIBUTION_ADDRESS_PRIVATE_KEY,
  WEB3_PROVIDER,
  CONTRACT_ADDRESS_KRP,
  CONTRACT_ADDRESS_RCP
} = process.env

const Provider = getProvider(WEB3_PROVIDER)
const KarmaPointsContract = getContract(Provider, KRP, CONTRACT_ADDRESS_KRP)
const CommunityPointsContract = getContract(Provider, RCP, CONTRACT_ADDRESS_RCP)
const Distributor = getAccount(Provider, DISTRIBUTION_ADDRESS_PRIVATE_KEY)

module.exports = {
  Distributor,
  Provider,
  CommunityPointsContract,
  KarmaPointsContract
}
