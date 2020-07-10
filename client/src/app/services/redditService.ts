import { get, find } from 'lodash';

import * as transportService from 'app/services/transportService';
import isAddress from 'app/util/isAddress';

import { IUserAddress } from 'interfaces';
import config from 'config';

export function parseThreadJSON (json): IUserAddress[] {
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

  return userAddressMap;
}

export async function getUserAddressMap (): Promise<IUserAddress[]> {
  const rawData = await transportService.get({
    url: `${config.userAddressUrl}.json`
  });

  return parseThreadJSON(rawData);
}
