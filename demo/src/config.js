require('dotenv').config()
const { ChildChain, RootChain } = require('@omisego/omg-js')
const { getAccount, getProvider, getContract } = require('./rootchain')

const { abi: KARMA } = require('../build/contracts/KarmaPoint.json')
const { abi: RCP } = require('../build/contracts/RedditCommunityPoint.json')

const {
  DISTRIBUTION_ADDRESS_PRIVATE_KEY: distributorPrivateKey,
  WEB3_PROVIDER,
  CONTRACT_ADDRESS_KARMA,
  CONTRACT_ADDRESS_RCP,
  CONTRACT_ADDRESS_PLASMA_FRAMEWORK: plasmaContractAddress,
  WATCHER_URL: watcherUrl
} = process.env

const provider = getProvider(WEB3_PROVIDER)
const Provider = getProvider(WEB3_PROVIDER)
const KarmaPointsContract = getContract(provider, KARMA, CONTRACT_ADDRESS_KARMA)
const CommunityPointsContract = getContract(provider, RCP, CONTRACT_ADDRESS_RCP)
const Distributor = getAccount(provider, distributorPrivateKey)
const rootchain = new RootChain({ web3: provider, plasmaContractAddress })
const childchain = new ChildChain({ watcherUrl, plasmaContractAddress })
const Alice = provider.eth.accounts.create()
const SubRedditServer = provider.eth.accounts.create()

KarmaPointsContract.symbol = 'KARMA'
CommunityPointsContract.symbol = 'RCP'

Distributor.name = 'Distributor'
Alice.name = 'Alice'
SubRedditServer.name = 'SubReddit Server'

const Accounts = {
  Alice,
  Distributor,
  SubRedditServer
}

const Clients = {
  Ethereum: {
    Provider
  },
  Plasma: {
    ChildChain: new ChildChain({ watcherUrl, plasmaContractAddress }),
    RootChain: new RootChain({ web3: Provider, plasmaContractAddress })
  }
}

const Contracts = {
  KARMA: KarmaPointsContract,
  RCP: CommunityPointsContract
}

const Config = { plasmaContractAddress }

module.exports = {
  Accounts,
  Clients,
  Config,
  Contracts,
  childchain,
  provider,
  rootchain
}
