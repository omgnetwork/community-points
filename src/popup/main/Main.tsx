import * as React from 'react';
import { useEffect, useState } from 'react';

import { ISubReddit } from 'popup/services/locationService';

import * as locationService from 'popup/services/locationService';
import * as messageService from 'popup/services/messageService';
import * as networkService from 'popup/services/networkService';
import * as styles from './Main.module.scss';

function Main () {
  const [ view, setView ] = useState('LOADING');
  const [ subReddit, setSubReddit ]: [ ISubReddit, any ] = useState(null);
  const [ address, setAddress ] = useState('');
  const [ amount, setAmount ] = useState(0);

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

  async function handleEnable (): Promise<any> {
    const enableResult = await messageService.send({
      type: 'WEB3/ENABLE'
    });
    console.log('enable result: ', enableResult);
  }

  function handleNewTab (): void {
    locationService.openTab('https://www.reddit.com/r/omise_go');
  }

  async function handleTransfer (): Promise<any> {
    const result = await networkService.transfer({
      amount,
      currency: subReddit.token,
      recipient: address,
      metadata: 'toto'
    });
    console.log('transfer result: ', result);
  }

  return (
    <div className={styles.Main}>
      <div>{view}</div>
      <div>
        {JSON.stringify(subReddit)}
      </div>
      <div onClick={handleNewTab}>
        Check out the OMG subreddit
      </div>
      <div onClick={handleEnable}>
        Enable web3
      </div>
      <input
        type='number'
        value={amount}
        onChange={e => setAmount(Number(e.target.value))}
        placeholder='Amount'
      />
      <input
        type='text'
        value={address}
        onChange={e => setAddress(e.target.value)}
        placeholder='Send some ROCK'
      />
      <div onClick={handleTransfer}>
        Transfer
      </div>
    </div>
  );
}

export default Main;
