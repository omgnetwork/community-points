import * as React from 'react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { saveSubReddit, saveConfig } from 'app/actions';

import * as locationService from 'app/services/locationService';
import * as networkService from 'app/services/networkService';
import * as configService from 'app/services/configService';
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
  const dispatch = useDispatch();
  const [ view, setView ]: [ IViewState, Dispatch<SetStateAction<IViewState>> ] = useState('LOADING');

  const [ configFetched, setConfigFetched ]: [ boolean, Dispatch<SetStateAction<boolean>> ] = useState(false);
  const [ validSubReddit, setValidSubReddit ]: [ boolean, Dispatch<SetStateAction<boolean>> ] = useState(false);
  const [ providerEnabled, setProviderEnabled ]: [ boolean, Dispatch<SetStateAction<boolean>> ] = useState(false);
  const [ correctNetwork, setCorrectNetwork ]: [ boolean, Dispatch<SetStateAction<boolean>> ] = useState(false);
  const [ errorMessage, setErrorMessage ]: [ string, Dispatch<SetStateAction<string>> ] = useState('');

  async function withErrorHandler (action: () => void): Promise<void> {
    try {
      await action();
    } catch (error) {
      const shouldSilence = errorService.shouldSilence(error);
      if (!shouldSilence) {
        errorService.log(error);
      }
      setErrorMessage(error.message);
      return setView('ERROR');
    }
  }

  // 0. fetch subreddit config
  useEffect(() => {
    // clear transaction history since same web3 account not guaranteed
    dispatch({ type: 'TRANSACTION/CLEAR/SUCCESS' });

    async function fetchConfig () {
      const subRedditConfig = await configService.fetchConfig();
      if (!subRedditConfig) {
        return setView('ERROR');
      }
      await dispatch(saveConfig(subRedditConfig));
      return setConfigFetched(true);
    }
    withErrorHandler(fetchConfig);
  }, []);

  // 1. check if valid subreddit
  useEffect(() => {
    async function checkCurrentPage () {
      const validSubReddit = await locationService.getCurrentSubReddit();
      if (!validSubReddit) {
        return setView('INVALID_COMMUNITY');
      }
      dispatch(saveSubReddit(validSubReddit));
      return setValidSubReddit(true);
    }
    if (configFetched) {
      withErrorHandler(checkCurrentPage);
    }
  }, [configFetched]);

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
      { (view as IViewState) === 'LOADING' && <Loading />}
      { (view as IViewState) === 'ERROR' && <ErrorView message={errorMessage} />}
      { (view as IViewState) === 'HOME' && <Home />}
      { (view as IViewState) === 'INVALID_COMMUNITY' && <InvalidCommunity />}
      { (view as IViewState) === 'NO_PROVIDER' && <NoProvider />}
      { (view as IViewState) === 'WRONG_NETWORK' && <WrongNetwork />}
    </div>
  );
}

export default React.memo(Main);
