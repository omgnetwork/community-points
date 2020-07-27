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
const { transaction } = require('@omisego/omg-js-util')
const { get, find, orderBy, difference } = require('lodash')
const fetch = require('node-fetch');
const snoowrap = require('snoowrap');
const burnAddr = process.env.BURN_ADDR
const curr = process.env.CURRENCY
const metadata = process.env.FLAIR_NAME
const watcher = process.env.WATCHER
const userAddressUrl = process.env.USER_THREAD
const subreddit = process.env.SUB

const price = parseInt( process.env.FLAIR_PRICE )
const r = new snoowrap({
  userAgent: process.env.USER_AGENT,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  username: process.env.USERNAME,
  password: process.env.PASSWORD
});

async function getAllTransactions({watcher, burnAddr, curr, limit}, page = 1, transactions = []) {
  const body = {address: burnAddr, currency: curr, limit: limit, page: page};
	const response = await fetch( `${ watcher }/transaction.all`, {
		method: 'post',
		body: JSON.stringify(body),
		headers: {'Content-Type': 'application/json'}
	});
	const { data } = await response.json();
  if ( data.length === 0) {
    return transactions
  } else {
    return await getAllTransactions({watcher, burnAddr, curr, limit}, page +1, [ ...transactions, ...data ])
  }
};

function isAddress (address) {
  if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
    return false;
  }
  return true;
};

function validPurchase(tx, price, curr, burnAddr, flairName) {
  return tx.outputs.reduce(function(accu, output) {
    const valid = [
      output.owner === burnAddr,
      tx.metadata === transaction.encodeMetadata(flairName),
      output.currency === curr,
      output.amount === price
    ]
    if (!valid.includes(false)) {
      return true
    }
  })
};

function getOwner(tx, curr) {
  return tx.inputs.find(input => input.currency === curr).owner
};

function flairGetter({ curr, burnAddr}, txs, purchaseVerifier) {
  return function (flairName, flairText, price) {
    const res = txs.reduce(function(owners, tx) {
      const isValid = purchaseVerifier(tx, price, curr, burnAddr, flairName)
      if(isValid) {
        owners.push(getOwner(tx, curr))
        return owners
      }
      return owners
    }, [])
    return { flairName: flairName, flairText: flairText, addresses: new Set(res) }
  }
};

function parseThreadJSON (json) {
  const rawComments = get(json, '[1].data.children', []);

  let userAddressMap = [];

  // sanitize and filter comments for addresses
  for (const comment of rawComments) {
    const rawText = comment.data.body;
    const words = rawText.trim().split(' ');

    for (const word of words) {
      if (isAddress(word)) {
        const commentCandidate = {
          author: comment.data.author,
          address: word.trim().toLowerCase(),
          authorFlairs: comment.data.author_flair_richtext,
          created: comment.data.created
        };

        // check if author already posted
        const existingAuthorComment = find(userAddressMap, [ 'author', comment.data.author ]);
        if (existingAuthorComment) {
          // compare created times
          if (existingAuthorComment.created > comment.data.created) {
            // if existing comment is newer than this one, diregard this comment
            break;
          }
          // since this comment is newer than whats existing, replace it with this one
          const _newMap = userAddressMap.filter(i => i.author !== comment.data.author);
          userAddressMap = [ ..._newMap, commentCandidate ];
          break;
        }

        // not existing, push it to the map
        userAddressMap.push(commentCandidate);

        // disregard the rest of the words
        break;
      }
    }
  }
  // sort user map
  const sortedUserMap = orderBy(userAddressMap, ['author'], ['asc']);
  return sortedUserMap;
}

async function getUserMap () {
  const response = await fetch( `${userAddressUrl}.json?limit=10000`)
	const data = await response.json();
	return parseThreadJSON(data);
}

function shouldUpdateFlair(purchased, current) {
  if (difference(purchased, current).length === 0 ) {
    return false
  }
  return true
}

// output the flairs update object for setMultipleUserFlairs
function buildMultipleUserFlairs (allusers, ...flairs) {
  let flairArrays = []
  for (const user of allusers) {
    //keep existing flairs
    const currentFlairs = user.authorFlairs.map(({a}) => a)
    const allPurchasedFlairs = flairs.reduce((allPurchasedFlairs, purchasedFlair) => {
      if(purchasedFlair.addresses.has(user.address)) {
        allPurchasedFlairs.push(purchasedFlair.flairText)
        return allPurchasedFlairs
      }
      return allPurchasedFlairs
    },[])
    // user did make a purchase and purchased flair dont exist
    if ( allPurchasedFlairs.length > 0 && shouldUpdateFlair(allPurchasedFlairs, currentFlairs)) {
      //update the flair, remove flair dups
      const toUpdateFlairs = Array.from( new Set([ ...allPurchasedFlairs, ...currentFlairs ]) ).join('')
        flairArrays.push({
            name: user.author,
            text: toUpdateFlairs,
            cssClass: ''
          })
    }
  }
  return flairArrays
}

async function setFlairs (updates, subreddit) {
  return await subreddit.setMultipleUserFlairs(updates)
}

(async () => {
	try {
    const txconfig = {
      watcher: watcher,
      burnAddr: burnAddr,
      curr: curr,
      limit: 100
    }
    const txs = await getAllTransactions(txconfig)
    const getFlair = flairGetter(txconfig, txs, validPurchase)
    const rUsers = await getUserMap()
    const flairArrays = buildMultipleUserFlairs(rUsers, getFlair('flair_omg', ':omg:', price))
    const update = await setFlairs(
      flairArrays,
      r.getSubreddit(subreddit)
    )
    console.log(update)
  } catch(err) {
    console.log(err)
  }
})();
