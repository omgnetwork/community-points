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
  currency,
  symbol,
  recipient,
  metadata
}) {
  return createAction(
    'TRANSACTION/CREATE',
    () => networkService.transfer({
      amount,
      currency,
      recipient,
      symbol,
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
