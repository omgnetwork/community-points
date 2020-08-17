import * as transportService from 'app/services/transportService';

import { IConfig } from 'interfaces';

export async function fetchConfig (): Promise<IConfig> {
  const rawSubRedditMap = await transportService.get({
    url: 'https://raw.githubusercontent.com/omgnetwork/community-points/nm-dynamic-flairs/client/subreddit.config.js'
  });

  console.log(rawSubRedditMap);
  return rawSubRedditMap;
}
