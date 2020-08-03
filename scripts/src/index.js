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
const snoowrap = require('snoowrap');
const util = require('./util.js')
const cron = require('node-cron');
const tx = require('./tx.js')
const flair = require('./flair.js')
const burnAddr = process.env.BURN_ADDR
const curr = process.env.CURRENCY
const watcher = process.env.WATCHER
const userAddressUrl = process.env.USER_THREAD
const subreddit = process.env.SUB
const r = new snoowrap({
  userAgent: process.env.USER_AGENT,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  username: process.env.USERNAME,
  password: process.env.PASSWORD
});


(async () => {
	try {
    cron.schedule('*/30 * * * *', async () => {
      const txconfig = {
        watcher: watcher,
        burnAddr: burnAddr,
        curr: curr,
        limit: 200
      }
      const burned = await tx.getAllBurned(txconfig)
      const getFlair = flair.flairGetter(txconfig, burned, util.validPurchase)
      const rUsers = await flair.getUserMap(userAddressUrl)
      const flairArrays = flair.buildMultipleUserFlairs(
        rUsers,
        getFlair('flair_rock', ':rock:', 1500),
        getFlair('flair_salamander', ':salamander:', 7000),
        getFlair('flair_soon', ':soon:', 10000)
      )
      console.log(flairArrays)
      const update = await flair.setFlairs(
        flairArrays,
        r.getSubreddit(subreddit)
      )
      console.log(update)
    })} catch(err) {
    console.log(err)
  }
})();
