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

const BigNumber = require('bignumber.js')
const BN = require('bn.js')

const subunitToUnit = (amount, decimals = 18) => {
  const divider = new BigNumber(10).pow(decimals)
  return new BigNumber(amount).div(divider).toFixed()
}

const unitToSubunit = (amount, decimals = 18) => {
  const multiplier = new BigNumber(10).pow(decimals)
  return new BigNumber(amount).times(multiplier).toFixed()
}

const unitToBN = (amount, decimals = 18) => {
  const subunit = unitToSubunit(amount, decimals)
  return new BN(subunit)
}

module.exports = { subunitToUnit, unitToBN, unitToSubunit }
