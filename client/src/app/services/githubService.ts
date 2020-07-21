import { get } from 'lodash';
import * as transportService from 'app/services/transportService';

export async function getLatestRelease (): Promise<string> {
  try {
    const rawData = await transportService.get({
      url: 'https://api.github.com/repos/omgnetwork/omg-js/releases'
    });
    if (rawData && rawData.length) {
      const tag: string = get(rawData[0], 'tag_name', null);
      const versionSplit = tag.split('v');
      return versionSplit[1];
    }
    return null;
  } catch (error) {
    return null;
  }
}
