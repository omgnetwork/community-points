import subRedditMap from 'subRedditMap';

export interface ISubReddit {
  token: string,
  subReddit: string
}

export function getCurrentSubReddit (): Promise<ISubReddit> {
  return new Promise((resolve, _) => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const url = tabs[0].url;
      const subReddit = url.match(/www.reddit.com\/r\/(.*?)\//);
      if (!subReddit) {
        return resolve(null);
      }
      const token = subRedditMap[subReddit[1]];
      if (!token) {
        return resolve(null);
      }
      return resolve({
        token,
        subReddit: subReddit[1]
      });
    });
  });
}
