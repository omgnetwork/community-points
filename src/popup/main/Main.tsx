import * as React from 'react';
import { useEffect, useState } from 'react';

import subRedditMap from 'subRedditMap';
import * as styles from './Main.module.scss';

function Main () {
  const [ view, setView ] = useState('LOADING');
  const [ subReddit, setSubReddit ] = useState(null);

  function getCurrentSubReddit (): Promise<{ token: string, subReddit: string }> {
    return new Promise((resolve, _) => {
      chrome.tabs.query({ active: true }, tabs => {
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

  useEffect(() => {
    async function checkCurrentPage () {
      const validSubReddit = await getCurrentSubReddit();
      if (validSubReddit) {
        setSubReddit(validSubReddit);
        return setView('SUPPORTED_COMMUNITY');
      }
      return setView('UNSUPPORTED_COMMUNITY');
    }
    checkCurrentPage();
  }, []);

  function handleEnable () {
    // send enable message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        'payload': 'WEB3/ENABLE'
      });
    });
  }

  function handleNewTab () {
    chrome.tabs.create({ url: 'https://www.reddit.com/r/omise_go' });
  }

  return (
    <div className={styles.Main}>
      {view}
      {JSON.stringify(subReddit)}
      <div onClick={handleNewTab}>
        Check out the best sub on Reddit
      </div>
      <div onClick={handleEnable}>
        Enable web3
      </div>
    </div>
  );
}

export default Main;
