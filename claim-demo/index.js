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

const { transaction } = require('@omisego/omg-js-util')
const logger = require('pino')({ prettyPrint: true })

const { Accounts, Contracts, Clients } = require('./src/config')
const ChildChain = require('./src/childchain')
const RootChain = require('./src/rootchain')

const { KARMA, RCP } = Contracts
const { Alice, Distributor, SubRedditServer } = Accounts
const ETH = { symbol: 'ETH', address: transaction.ETH_CURRENCY }

const runClaimScript = async () => {
  logger.info(`${KARMA.symbol} contract address is ${KARMA.address}`)
  logger.info(`${RCP.symbol} contract address is ${RCP.address}`)
  logger.info(`${Distributor.name} address is ${Distributor.address}`)

  /* Minting KARMA */
  await RootChain.getBalance(KARMA, Distributor)
  await RootChain.callMint(
    KARMA,
    Distributor,
    Distributor,
    '100',
    Clients.Ethereum.Provider
  )
  await RootChain.getBalance(KARMA, Distributor)

  /* Minting RCP */
  await RootChain.getBalance(RCP, Distributor)
  await RootChain.callMint(
    RCP,
    Distributor,
    Distributor,
    '100',
    Clients.Ethereum.Provider
  )
  await RootChain.getBalance(RCP, Distributor)

  /* Depositing ETH for use as trransaction fees*/
  await ChildChain.getBalance(Distributor, ETH)
  await RootChain.depositEth(
    Distributor,
    '0.01',
    Clients.Ethereum.Provider,
    Clients.Plasma.RootChain
  )
  await ChildChain.getBalance(Distributor, ETH)

  /* Approving ERC-20s for deposit */
  await RootChain.approveErc20(
    KARMA,
    Distributor,
    100,
    Clients.Plasma.RootChain
  )
  await RootChain.approveErc20(RCP, Distributor, 100, Clients.Plasma.RootChain)

  /* Depositing ERC-20s */
  await ChildChain.getBalance(Distributor, KARMA)
  await RootChain.depositErc20(
    Distributor,
    '100',
    KARMA,
    Clients.Plasma.RootChain,
    Clients.Ethereum.Provider
  )
  await ChildChain.getBalance(Distributor, KARMA)

  await ChildChain.getBalance(Distributor, RCP)
  await RootChain.depositErc20(
    Distributor,
    '100',
    RCP,
    Clients.Plasma.RootChain,
    Clients.Ethereum.Provider
  )
  await ChildChain.getBalance(Distributor, RCP)

  let balance
  /* Transfering KARMA to Alice on the OMG Network */
  balance = await ChildChain.getBalance(Alice, KARMA)
  await ChildChain.transfer(Distributor, Alice, '100', KARMA)
  await ChildChain.waitForTransfer(Alice, balance, '100', KARMA)
  await ChildChain.getBalance(Alice, KARMA)

  /* Transfering RCP to the SubReddit Server on the OMG Network */
  balance = await ChildChain.getBalance(SubRedditServer, RCP)
  await ChildChain.transfer(Distributor, SubRedditServer, '100', RCP)
  await ChildChain.waitForTransfer(SubRedditServer, balance, '100', RCP)
  await ChildChain.getBalance(SubRedditServer, RCP)

  /* Executing claim/redeem atomic swap */

  logger.info(
    `${Alice.name} would now like to redeem her KARMA for Reddit Community Points`
  )
  balance = await ChildChain.getBalance(Alice, RCP)
  await ChildChain.claimCommunityPoints(
    Alice,
    KARMA.address,
    '100',
    SubRedditServer,
    RCP.address,
    Distributor,
    transaction.ETH_CURRENCY
  )
  await ChildChain.waitForTransfer(Alice, balance, '100', RCP)
  await ChildChain.getBalance(Alice, RCP)
  logger.info(`${Alice.name} has claimed her Reddit Community Points`)
}

runClaimScript()
