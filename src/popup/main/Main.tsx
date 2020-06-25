import * as React from 'react';
import { useEffect, useState } from 'react';

import * as locationService from 'popup/services/locationService';
import * as messageService from 'popup/services/messageService';
import * as styles from './Main.module.scss';

function Main () {
  const [ view, setView ] = useState('LOADING');
  const [ subReddit, setSubReddit ] = useState(null);

  useEffect(() => {
    async function checkCurrentPage () {
      const validSubReddit = await locationService.getCurrentSubReddit();
      if (validSubReddit) {
        setSubReddit(validSubReddit);
        return setView('SUPPORTED_COMMUNITY');
      }
      return setView('UNSUPPORTED_COMMUNITY');
    }
    checkCurrentPage();
  }, []);

  function handleEnable () {
    messageService.toBridge({ type: 'WEB3/ENABLE' });
  }

  function handleNewTab () {
    chrome.tabs.create({ url: 'https://www.reddit.com/r/omise_go' });
  }

  return (
    <div className={styles.Main}>
      <div>{view}</div>
      <div>
        {JSON.stringify(subReddit)}
      </div>
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
