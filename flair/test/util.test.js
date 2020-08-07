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
const util = require('../src/util.js')
const assert = require('chai').assert;

describe('util',  () => {
  describe('.isAddress()', () => {
    it('should return true for valid address', () => {
      assert.equal(util.isAddress("0x8db1acea6c904955bb49afc3824131aeedb0322d"), true)
    })
    it('should return false for invalid address length', () => {
      assert.equal(util.isAddress("0x8db1acea6c904955bb49afc3824131aeedb03"), false)
    })
  })

  describe('.getOwner()', () => {
    const mockTx = {
      inputs: [
        {currency: "0xabcd", owner: "0x123"},
        {currency: "0xEFGH", owner: "0x456"},
        {currency: "0xijkl", owner: "0x6789"}
      ]
    }
    it('should find the right owner for transaction for specific currency', () => {
      assert.equal(util.getOwner(mockTx, "0xabcd"), "0x123")
    })
    it('should return the right owner although inputs currency is capitalized', () => {
      assert.equal(util.getOwner(mockTx, "0xefgh"), "0x456")
    })
    it('should return the right owner although currency to find is capitalized', () => {
      assert.equal(util.getOwner(mockTx, "0xIJKL"), "0x6789")
    })
  })

  describe('.validPurchase()', () => {
    beforeEach(() => {
      this.mockTx = {
        outputs: [],
        metadata: '0x00000000000000000000000000000000666c6169725f73616c616d616e646572'
      }
    })
    it('should return true when tx is valid', () => {
      const output = {
        owner: '0xdead',
        currency: '0x123',
        amount: 1e+22
      }
      this.mockTx.outputs = this.mockTx.outputs.concat(output)
      assert.equal(util.validPurchase(this.mockTx, 10000, '0x123', '0xdead', 'flair_salamander'), output)
    })
    it('should return undefined when tx is invalid', () => {
      const output = {
        owner: '0xalive',
        currency: '0x123',
        amount: 1e+22
      }
      this.mockTx.outputs = this.mockTx.outputs.concat(output)
      assert.isUndefined(util.validPurchase(this.mockTx, 10000, '0x123', '0xdead', 'flair_salamander'))
    })
    it('should respect uppercase currency', () => {
      const output = {
        owner: '0xdead',
        currency: '0xABC',
        amount: 1e+22
      }
      this.mockTx.outputs = this.mockTx.outputs.concat(output)
      assert.equal(util.validPurchase(this.mockTx, 10000, '0xabc', '0xdead', 'flair_salamander'), output)
    })
  })
})
