import { createAction } from 'app/actions/createAction';
import * as networkService from 'app/services/networkService';

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
