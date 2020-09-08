import { createAction } from 'app/actions/createAction';
import * as networkService from 'app/services/networkService';
import * as redditService from 'app/services/redditService';

import { ISubReddit, IConfig } from 'interfaces';

export function getSession () {
  return createAction(
    'SESSION/GET',
    () => networkService.getSession()
  );
}

export function merge ({
  subReddit
}) {
  return createAction(
    'TRANSACTION/CREATE',
    () => networkService.merge({
      subReddit
    })
  );
}

export function transfer ({
  amount,
  recipient,
  subReddit,
  metadata,
  spendableUtxos
}) {
  return createAction(
    'TRANSACTION/CREATE',
    () => networkService.transfer({
      amount,
      recipient,
      subReddit,
      metadata,
      spendableUtxos
    })
  );
}

export function getTransactions () {
  return createAction(
    'TRANSACTION/GETALL',
    () => networkService.getAllTransactions()
  );
}

export function getUserAddressMap () {
  return createAction(
    'USERADDRESSMAP/GET',
    () => redditService.getUserAddressMap()
  );
}

export function getUserAvatar (username: string) {
  return createAction(
    'USERAVATAR/GET',
    () => redditService.getUserAvatar(username)
  );
}

export function clearError () {
  return function dispatchClearError (dispatch) {
    return dispatch({ type: 'UI/ERROR/UPDATE', payload: null });
  };
}

export function showError (message: string) {
  return function dispatchShowError (dispatch) {
    return dispatch({ type: 'UI/ERROR/UPDATE', payload: message });
  };
}

export function saveSubReddit (subReddit: ISubReddit) {
  return function dispatchSaveSubReddit (dispatch) {
    return dispatch({ type: 'SUBREDDIT/GET/SUCCESS', payload: subReddit });
  };
}

export function saveConfig (config: IConfig) {
  return function dispatchSaveConfig (dispatch) {
    return dispatch({ type: 'CONFIG/GET/SUCCESS', payload: config });
  };
}
