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
  decimals,
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
      decimals,
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
