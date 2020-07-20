import * as React from 'react';
import { useEffect, useState } from 'react';

import * as locationService from 'app/services/locationService';
import * as networkService from 'app/services/networkService';
import * as errorService from 'app/services/errorService';

import Loading from 'app/views/loading/Loading';
import ErrorView from 'app/views/errorview/ErrorView';
import Home from 'app/views/home/Home';
import InvalidCommunity from 'app/views/invalidcommunity/InvalidCommunity';
import NoProvider from 'app/views/noprovider/NoProvider';
import WrongNetwork from 'app/views/wrongnetwork/WrongNetwork';

import config from 'config';

import * as styles from './Main.module.scss';

type IViewState = 'LOADING' | 'HOME' | 'INVALID_COMMUNITY' | 'NO_PROVIDER' | 'WRONG_NETWORK' | 'ERROR';

function Main (): JSX.Element {
  const [ view, setView ]: [ IViewState, any ] = useState('LOADING');

  const [ validSubReddit, setValidSubReddit ]: [ boolean, any ] = useState(false);
  const [ providerEnabled, setProviderEnabled ]: [ boolean, any ] = useState(false);
  const [ correctNetwork, setCorrectNetwork ]: [ boolean, any ] = useState(false);
  const [ errorMessage, setErrorMessage ]: [ string, any ] = useState('');

  async function withErrorHandler (action: () => void): Promise<void> {
    try {
      await action();
    } catch (error) {
      errorService.log(error);
      setErrorMessage(error.message);
      return setView('ERROR');
    }
  }

  // 1. check if valid subreddit
  useEffect(() => {
    async function checkCurrentPage () {
      const validSubReddit = await locationService.getCurrentSubReddit();
      if (!validSubReddit) {
        return setView('INVALID_COMMUNITY');
      }
      return setValidSubReddit(true);
    }
    withErrorHandler(checkCurrentPage);
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
    if (validSubReddit) {
      withErrorHandler(checkWeb3ProviderExists);
    }
  }, [validSubReddit]);

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
      withErrorHandler(checkWeb3ProviderNetwork);
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
      { (view as any) === 'ERROR' && <ErrorView message={errorMessage} />}
      { (view as any) === 'HOME' && <Home />}
      { (view as any) === 'INVALID_COMMUNITY' && <InvalidCommunity />}
      { (view as any) === 'NO_PROVIDER' && <NoProvider />}
      { (view as any) === 'WRONG_NETWORK' && <WrongNetwork />}
    </div>
  );
}

export default React.memo(Main);
