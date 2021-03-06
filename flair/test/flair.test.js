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
const flair = require('../src/flair.js')
const expect = require('chai').expect;
const assert = require('chai').assert;
const sinon = require('sinon');

describe('Flair',  () => {
  describe('.shouldUpdateFlair()', () => {
    it('should return false when the user does not have any purchased flairs', () => {
      const purchased = []
      const current = [":snoo:"]
      assert.equal(flair.shouldUpdateFlair(purchased, current), false)
    })
    it('should return true when the curent flairs dont have purchased flairs', () => {
      const purchased = [":rock:", ":omg:"]
      const current = [":snoo:"]
      assert.equal(flair.shouldUpdateFlair(purchased, current), true)
    })
    it('should return true when current flairs dont have all the purchased flairs', () => {
      const purchased = ["rock", "omg"]
      const current = [":snoo:", ":rock:"]
      // console.log(flair.shouldUpdateFlair(purchased, current))
      assert.equal(flair.shouldUpdateFlair(purchased, current), true)
    })
    it('should return false when current flairs already have all the purchased flairs', () => {
      const purchased = [":rock:", ":omg:"]
      const current = [":snoo:", ":rock:", ":omg:"]
      assert.equal(flair.shouldUpdateFlair(purchased, current), false)
    })
    it('should return true if upgrade flairs are not shown on current flairs', () => {
      const purchased = [":rock:", ":rock-2:", ":omg:"]
      const current = [":snoo:", ":rock:", ":omg:"]
      assert.equal(flair.shouldUpdateFlair(purchased, current), true)
    })
    it('should return false if current flairs lvl are all upgraded', () => {
      const purchased = [":rock:", ":omg:", ":omg-2:", ":omg-3:"]
      const current = [":snoo:", ":rock:", ":omg-3:"]
      assert.equal(flair.shouldUpdateFlair(purchased, current), false)
    })
    it('should return false if current flairs lvl are all upgraded, and purchased order is descending', () => {
      const purchased = [":rock:", ":omg-3:", ":omg-2:", ":omg:"]
      const current = [":snoo:", ":rock:", ":omg-3:"]
      assert.equal(flair.shouldUpdateFlair(purchased, current), false)
    })
  })

  describe('.setFlairs()', () => {
    it('should call subreddit API once with the correct updates obj', async () => {
      const redditMock = { setMultipleUserFlairs: async (arg) => arg ? Promise.resolve(true) : Promise.resolve(false) }
      const result = await flair.setFlairs(true, redditMock)
      assert.equal(result, true)
    })
  })

  describe('.flairGetter()', () => {
    beforeEach(() => {
      this.currency = '0x123'
      this.owner = '0xabc'
    })
    it('should get the correct owner address on valid purchase', () => {
      const txs = [{
        inputs: [{
          currency: this.currency, owner: this.owner
        }]
      }]
      const flairFunc = flair.flairGetter({
        curr: this.currency,
        burnAddr: '0xdead'
      }, txs, () => true)
      const expectedFlair = { flairName: 'some_flair', flairText: 'flair', addresses: new Set([ this.owner ])}
      assert.deepEqual(flairFunc('some_flair', 'flair', 100), expectedFlair)
    })
    it('should return empty addresses for no valid purchase', () => {
      const txs = [{
        inputs: [{
          currency: this.currency, owner: this.owner
        }]
      }]
      const flairFunc = flair.flairGetter({
        curr: this.currency,
        burnAddr: '0xdead'
      }, txs, () => false)
      const expectedFlair = { flairName: 'some_flair', flairText: 'flair', addresses: new Set([ ])}
      assert.deepEqual(flairFunc('some_flair', 'flair', 100), expectedFlair)
    })
  })

  describe('.filterLevel', () => {
    it('should return all unleveled flairs', () => {
      let sampleflairs = [":foo:", ":bar:", ":baz:"]
      const filteredFlairs = flair.filterLevel(sampleflairs)
      assert.deepEqual(
        [filteredFlairs.has(":foo:"),
         filteredFlairs.has(":bar:"),
         filteredFlairs.has(":baz:")],
        [true,true,true]
      )
    })
    it('should return a highest leveled flair', () => {
      let sampleflairs = [":foo:", ":bar:", ":baz:", ":baz-2:", ":baz-3:", ":foo-2:"]
      const filteredFlairs = flair.filterLevel(sampleflairs)
      assert.deepEqual(filteredFlairs.size, new Set([":foo-2:", ":bar:", ":baz-3:"]).size)
      assert(filteredFlairs.has(":baz-3:"))
      assert(filteredFlairs.has(":foo-2:"))
    })

    it('should return correct level even if order of upgrades are descending', () => {
      let sampleflairs = [":foo-3", ":foo-2:", ":bar:", ":baz:", ":foo:"]
      const filteredFlairs = flair.filterLevel(sampleflairs)
      assert(filteredFlairs.has(":foo-3:"))
      assert(!filteredFlairs.has(":foo:"))
      assert(filteredFlairs.has(":bar:"))
    })

    it('should not allow user to skip a flair level on ascending order', () => {
      let sampleflairs = [":foo:", ":bar:", ":baz:", ":foo-3:"]
      const filteredFlairs = flair.filterLevel(sampleflairs)
      assert(!filteredFlairs.has(":foo-3:"))
      assert(filteredFlairs.has(":foo:"))
    })

    it('should ignore dups', () => {
      let sampleflairs = [":foo", ":bar:", ":baz:",":foo:", ":bar:", ":baz:", ":foo-2:"]
      const filteredFlairs = flair.filterLevel(sampleflairs)
      assert(!filteredFlairs.has(":foo:"))
      assert(filteredFlairs.has(":foo-2:"))
      assert(filteredFlairs.has(":bar:"))
      assert(filteredFlairs.has(":baz:"))
      assert.equal(filteredFlairs.size, 3)
    })

    
  })

})
