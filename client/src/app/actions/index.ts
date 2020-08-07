import { createAction } from 'app/actions/createAction';
import * as networkService from 'app/services/networkService';
import * as redditService from 'app/services/redditService';

import { ISubReddit } from 'interfaces';

export function getSession () {
  return createAction(
    'SESSION/GET',
    () => networkService.getSession()
  );
}

export function transfer ({
  amount,
  recipient,
  subReddit,
  metadata
}) {
  return createAction(
    'TRANSACTION/CREATE',
    () => networkService.transfer({
      amount,
      recipient,
      subReddit,
      metadata
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
