import { createAction } from 'app/actions/createAction';
import * as networkService from 'app/services/networkService';
import * as redditService from 'app/services/redditService';

export function getSession () {
  return createAction(
    'SESSION/GET',
    () => networkService.getSession()
  );
}

export function transfer ({
  amount,
  recipient,
  subReddit
}) {
  return createAction(
    'TRANSACTION/CREATE',
    () => networkService.transfer({
      amount,
      recipient,
      subReddit
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
  return function (dispatch) {
    return dispatch({ type: 'UI/ERROR/UPDATE', payload: null });
  };
}

export function showError (message: string) {
  return function (dispatch) {
    return dispatch({ type: 'UI/ERROR/UPDATE', payload: message });
  };
}
