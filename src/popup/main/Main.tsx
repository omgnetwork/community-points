import * as React from 'react';
import { useEffect, useState } from 'react';

import { ISubReddit } from 'popup/services/locationService';
import * as locationService from 'popup/services/locationService';
import * as networkService from 'popup/services/networkService';

import Loading from 'popup/views/loading/Loading';
import Home from 'popup/views/home/Home';
import InvalidCommunity from 'popup/views/invalidcommunity/InvalidCommunity';
import NoProvider from 'popup/views/noprovider/NoProvider';
import WrongNetwork from 'popup/views/wrongnetwork/WrongNetwork';

import config from 'config';

import * as styles from './Main.module.scss';

type IViewState = 'LOADING' | 'HOME' | 'INVALID_COMMUNITY' | 'NO_PROVIDER' | 'WRONG_NETWORK';

function Main () {
  const [ view, setView ]: [ IViewState, any ] = useState('LOADING');
  const [ subReddit, setSubReddit ]: [ ISubReddit, any ] = useState(null);
  const [ providerEnabled, setProviderEnabled ]: [ boolean, any ] = useState(false);
  const [ correctNetwork, setCorrectNetwork ]: [ boolean, any ] = useState(false);

  // 1. check if valid subreddit
  useEffect(() => {
    async function checkCurrentPage () {
      const validSubReddit = await locationService.getCurrentSubReddit();
      if (!validSubReddit) {
        return setView('INVALID_COMMUNITY');
      }
      return setSubReddit(validSubReddit);
    }
    checkCurrentPage();
  }, []);

  // 2. check if provider installed, and enable if so
  useEffect(() => {
    async function checkWeb3ProviderExists () {
      const exists = await networkService.checkWeb3ProviderExists();
      if (!exists) {
        return setView('NO_PROVIDER');
      }
      await networkService.enableWeb3Provider();
      return setProviderEnabled(true);
    }
    if (subReddit) {
      checkWeb3ProviderExists();
    }
  }, [subReddit]);

  // 3. check if provider pointed to the correct network
  useEffect(() => {
    async function checkWeb3ProviderNetwork () {
      const network = await networkService.getWeb3ProviderNetwork();
      if (network !== config.network) {
        return setView('WRONG_NETWORK');
      }
      return setCorrectNetwork(true);
    }
    if (providerEnabled) {
      checkWeb3ProviderNetwork();
    }
  }, [providerEnabled]);

  // 4. if correct network, render app
  useEffect(() => {
    if (correctNetwork) {
      return setView('HOME');
    }
  }, [correctNetwork]);

  return (
    <div className={styles.Main}>
      { (view as any) === 'LOADING' && <Loading />}
      { (view as any) === 'HOME' && <Home subReddit={subReddit} />}
      { (view as any) === 'INVALID_COMMUNITY' && <InvalidCommunity />}
      { (view as any) === 'NO_PROVIDER' && <NoProvider />}
      { (view as any) === 'WRONG_NETWORK' && <WrongNetwork />}
    </div>
  );
}

export default React.memo(Main);
