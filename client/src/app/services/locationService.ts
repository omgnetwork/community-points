/* global chrome */
import store from 'app/store';
import { ISubReddit, ITab } from 'interfaces';

export function getCurrentSubReddit (): Promise<ISubReddit> {
  return new Promise((resolve, reject) => {
    chrome.tabs.query(
      { active: true, currentWindow: true },
      async function withTabsQuery (tabs: ITab[]) {
        try {
          const url = tabs[0].url;
          const subReddit = url.match(/reddit.com\/r\/(.*?)\//);
          if (!subReddit) {
            return resolve(null);
          }
          const name = subReddit[1];
          const state = store.getState();
          const subRedditObject = state.config[name];

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
      }
    );
  });
}

export function openTab (url: string): void {
  return chrome.tabs.create({ url });
}

// only performs callback on valid subreddit
export function onValidSubreddit (callback: () => void): void {
  try {
    chrome.tabs.query(
      { active: true, currentWindow: true },
      function withTabsQuery (tabs: ITab[]) {
        const currentTabUrl = tabs[0].url;
        const subReddit = currentTabUrl.match(/reddit.com\/r\/(.*?)\//);
        if (!subReddit) {
          return null;
        }
        const name = subReddit[1];
        const state = store.getState();
        const subRedditObject = state.config[name];
        if (subRedditObject) {
          callback();
        }
      }
    );
  } catch (error) {
    //
  }
};
