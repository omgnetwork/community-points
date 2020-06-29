import { createAction } from 'app/actions/createAction';
import * as networkService from 'app/services/networkService';

export function transfer ({
  amount,
  currency,
  recipient,
  metadata
}) {
  return createAction(
    'TRANSFER/CREATE',
    () => networkService.transfer({
      amount,
      currency,
      recipient,
      metadata
    })
  );
}
