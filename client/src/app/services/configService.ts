import * as transportService from 'app/services/transportService';

import { IConfig } from 'interfaces';

const configBranch = 'master';

export async function fetchConfig (): Promise<IConfig> {
  const config = await transportService.get({
    url: `https://raw.githubusercontent.com/omgnetwork/community-points/${configBranch}/client/subreddit.config.json`
  });
  return config;
}
