import { createAction } from 'app/actions/createAction';
import * as networkService from 'app/services/networkService';

export function transfer ({
  amount,
  currency,
  recipient,
  metadata
}) {
  return createAction(
    'TRANSACTION/CREATE',
    () => networkService.transfer({
      amount,
      currency,
      recipient,
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
