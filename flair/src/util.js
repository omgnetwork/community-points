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
const BigNumber = require('bignumber.js');

module.exports = {
  isAddress: function (address) {
    if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
      return false;
    }
    return true;
  },

  validPurchase: function (tx, price, curr, burnAddr, flairName) {
    return tx.outputs.find(function(output) {
      const x = new BigNumber(price);
      const exp = new BigNumber(10).pow(18); //assume token is 18 decimals

      const powOutput = new BigNumber(output.amount)
      const calculated = x.multipliedBy(exp);
      const valid = [
        output.owner === burnAddr,
        tx.metadata === transaction.encodeMetadata(flairName),
        output.currency.toLowerCase() === curr.toLowerCase(),
        powOutput.comparedTo(calculated) === 0
      ]
      if (!valid.includes(false)) {
        return true
      }
    })
  },

  getOwner: function (tx, curr) {
    return tx.inputs.find(input => input.currency.toLowerCase() === curr.toLowerCase()).owner
  }
}
