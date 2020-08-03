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
const assert = require('assert');

describe('Flair',  () => {
  describe('.shouldUpdateFlair()', () => {
    it('should return false when the user does not have any purchased flairs', () => {
      const purchased = []
      const current = ["snoo"]
      assert.equal(flair.shouldUpdateFlair(purchased, current), false)
    })
    it('should return true when the curent flairs dont have purchased flairs', () => {
      const purchased = ["rock", "omg"]
      const current = ["snoo"]
      assert.equal(flair.shouldUpdateFlair(purchased, current), true)
    })
    it('should return false when current flairs already have all the purchased flairs', () => {
      const purchased = ["rock", "omg"]
      const current = ["snoo", "rock", "omg"]
      assert.equal(flair.shouldUpdateFlair(purchased, current), false)
    })
    it('should return true when current flairs dont have all the purchased flairs', () => {
      const purchased = ["rock", "omg"]
      const current = ["snoo", "rock"]
      assert.equal(flair.shouldUpdateFlair(purchased, current), true)
    })
  })
})
