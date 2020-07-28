require('dotenv').config()
const { ChildChain, RootChain } = require('@omisego/omg-js')
const { getAccount, getProvider, getContract } = require('./helpers')

const { abi: KRP } = require('../build/contracts/KarmaPoint.json')
const { abi: RCP } = require('../build/contracts/RedditCommunityPoint.json')

const {
  DISTRIBUTION_ADDRESS_PRIVATE_KEY: distributorPrivateKey,
  WEB3_PROVIDER,
  CONTRACT_ADDRESS_KRP,
  CONTRACT_ADDRESS_RCP,
  CONTRACT_ADDRESS_PLASMA_FRAMEWORK: plasmaContractAddress,
  WATCHER_URL: watcherUrl
} = process.env

const provider = getProvider(WEB3_PROVIDER)
const KarmaPointsContract = getContract(provider, KRP, CONTRACT_ADDRESS_KRP)
const CommunityPointsContract = getContract(provider, RCP, CONTRACT_ADDRESS_RCP)
const distributor = getAccount(provider, distributorPrivateKey)
const rootchain = new RootChain({ web3: provider, plasmaContractAddress })
const childchain = new ChildChain({ watcherUrl, plasmaContractAddress })

distributor.name = 'Distributor'

module.exports = {
  childchain,
  distributor,
  provider,
  rootchain,
  CommunityPointsContract,
  KarmaPointsContract
}
