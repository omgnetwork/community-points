/* global chrome */
import subRedditMap from 'subRedditMap';
import { ISubReddit } from 'interfaces';

export function getCurrentSubReddit (): Promise<ISubReddit> {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      try {
        const url = tabs[0].url;
        const subReddit = url.match(/reddit.com\/r\/(.*?)\//);
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
        reject(new Error(error));
      }
    });
  });
}

export function openTab (url: string): void {
  return chrome.tabs.create({ url });
}
