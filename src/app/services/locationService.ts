/* global chrome */
import subRedditMap from 'subRedditMap';

export interface ISubReddit {
  token: string,
  name: string,
  symbol: string
}

export function getCurrentSubReddit (): Promise<ISubReddit> {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      try {
        const url = tabs[0].url;
        const subReddit = url.match(/www.reddit.com\/r\/(.*?)\//);
        if (!subReddit) {
          return resolve(null);
        }
        const name = subReddit[1];
        const subRedditObject = subRedditMap[name];
        if (!subRedditObject) {
          return resolve(null);
        }
        return resolve({
          ...subRedditObject,
          name
        });
      } catch (error) {
        reject(error);
      }
    });
  });
}

export function openTab (url: string): void {
  return chrome.tabs.create({ url });
}
