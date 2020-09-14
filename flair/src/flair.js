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
const { remove, head, split, trim, get, find, orderBy, difference } = require('lodash')
const fetch = require('node-fetch');
const util = require('./util.js')

module.exports = {
  
  flairGetter: function ({ curr, burnAddr}, txs, purchaseVerifier) {
    return function (flairName, flairText, price) {
      const res = txs.reduce(function(owners, tx) {
        const isValid = purchaseVerifier(tx, price, curr, burnAddr, flairName)
        if(isValid) {
          owners.push(util.getOwner(tx, curr))
          return owners
        }
        return owners
      }, [])
      return { flairName: flairName, flairText: flairText, addresses: new Set(res) }
    }
  },

  parseThreadJSON: function (json) {
    const rawComments = get(json, '[1].data.children', []);

    let userAddressMap = [];

    // sanitize and filter comments for addresses
    for (const comment of rawComments) {
      const rawText = comment.data.body;
      const words = rawText.trim().replace(/\n/g, ' ').split(' ');

      for (const word of words) {
        if (util.isAddress(word)) {
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
  },

  getUserMap: async function (userAddressUrl) {
    const response = await fetch( `${userAddressUrl}.json?limit=10000`)
	  const data = await response.json();
	  return this.parseThreadJSON(data);
  },

  shouldUpdateFlair: function (purchased, current) {
    const lvlflair = new RegExp('-[0-9]+');
    const name = (flr) => trim(head(split(flr, '-')), ':')

    let parsed = purchased.map((flr) => {
      if (flr.match(lvlflair)) {
        return { name: name(flr), lvl: parseInt(flr.match(/\d+/g).join([])) }
      } else {
        return { name: name(flr), lvl: 1 }
      }})
        .sort((a, b) => {
          if (a.name === b.name && a.lvl !== b.lvl) {
            // only compare lvl under same name
            return a.lvl - b.lvl;
          }
          return a.name > b.name ? 1 : -1;
        })

    let highest = []
    for (const flr of parsed) {
      let prevFlair = find(highest, (h) => h.name === flr.name)
      if (!prevFlair && flr.lvl === 1) {
        highest.push(flr)
      }
      if (prevFlair && flr.lvl === prevFlair.lvl + 1) {
        remove(highest, prevFlair)
        highest.push(flr)
      }
    }
    // let bought = highest.map(val => ':'.concat(val.name, ':'))
    let bought = highest.map((flr) => {
      if (flr.lvl === 1) {
        return ':'.concat(flr.name, ':')
      } else {
        return ':'.concat(flr.name, '-', flr.lvl.toString(), ':')
      }
    })
    if (difference(bought, current).length === 0 ) {
      return false
    }
    return true
  },

  // filter out older level flairs, expect low level first
  filterLevel: function (flairs) {
    const lvlflair = new RegExp('-[0-9]+');
    const name = (flr) => trim(head(split(flr, '-')), ':')

    let parsed = flairs.map((flr) => {
      if (flr.match(lvlflair)) {
        return { name: name(flr), lvl: parseInt(flr.match(/\d+/g).join([])) }
      } else {
        return { name: name(flr), lvl: 1 }
      }})
        .sort((a, b) => {
          if (a.name === b.name && a.lvl !== b.lvl) {
            // only compare lvl under same name
            return a.lvl - b.lvl;
          }
          return a.name > b.name ? 1 : -1;
        })
    // console.log(parsed)

    let highest = []
    for (const flr of parsed) {
      let prevFlair = find(highest, (h) => h.name === flr.name)
      if (!prevFlair && flr.lvl === 1) {
        highest.push(flr)
      }
      if (prevFlair && flr.lvl === prevFlair.lvl + 1) {
        remove(highest, prevFlair)
        highest.push(flr)
      }
    }
    return new Set(highest.map((flr) => {
      if (flr.lvl === 1) {
        return ':'.concat(flr.name, ':')
      } else {
        return ':'.concat(flr.name, '-', flr.lvl.toString(), ':')
      }
    }))
  },

  // output the flairs update object for setMultipleUserFlairs
  // if all flairs are upgradeable, flairs to be sorted by order of levels
  buildMultipleUserFlairs: function (allusers, ...flairs) {
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
      if ( allPurchasedFlairs.length > 0 && this.shouldUpdateFlair(allPurchasedFlairs, currentFlairs)) {
        //update the flair, remove flair dups
        const toUpdateFlairs = Array.from( this.filterLevel([ ...allPurchasedFlairs, ...currentFlairs ]) ).join('')
        flairArrays.push({
          name: user.author,
          text: toUpdateFlairs,
          cssClass: ''
        })
      }
    }
    return flairArrays
  },

  setFlairs: async function (updates, subreddit) {
    return await subreddit.setMultipleUserFlairs(updates)
  }
}
