/*
  Copyright 2019 OmiseGO Pte Ltd

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

require('dotenv').config()
const { ChildChain, RootChain } = require('@omisego/omg-js')
const { getAccount, getProvider, getContract } = require('./rootchain')

const { abi: KARMA } = require('../build/contracts/KarmaPoint.json')
const { abi: RCP } = require('../build/contracts/RedditCommunityPoint.json')

const {
  DISTRIBUTION_ADDRESS_PRIVATE_KEY: distributorPrivateKey,
  WEB3_PROVIDER,
  CONTRACT_ADDRESS_KARMA: karmaContractAddress,
  CONTRACT_ADDRESS_RCP: rcpContractAddress,
  CONTRACT_ADDRESS_PLASMA_FRAMEWORK: plasmaContractAddress,
  WATCHER_URL: watcherUrl
} = process.env

const Provider = getProvider(WEB3_PROVIDER)
const KarmaPointsContract = getContract(Provider, KARMA, karmaContractAddress)
const CommunityPointsContract = getContract(Provider, RCP, rcpContractAddress)
const Distributor = getAccount(Provider, distributorPrivateKey)
const rootChain = new RootChain({ web3: Provider, plasmaContractAddress })
const childChain = new ChildChain({ watcherUrl, plasmaContractAddress })
const Alice = Provider.eth.accounts.create()
const SubRedditServer = Provider.eth.accounts.create()

KarmaPointsContract.symbol = 'KARMA'
CommunityPointsContract.symbol = 'RCP'
KarmaPointsContract.address = karmaContractAddress
CommunityPointsContract.address = rcpContractAddress

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
    ChildChain: childChain,
    RootChain: rootChain
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
  Contracts
}
