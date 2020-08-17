import * as transportService from 'app/services/transportService';

import { IConfig } from 'interfaces';

export async function fetchConfig (): Promise<IConfig> {
  const config = await transportService.get({
    url: 'https://raw.githubusercontent.com/omgnetwork/community-points/nm-dynamic-flairs/client/subreddit.config.json'
  });
  return config;
}
