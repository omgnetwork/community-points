import { keyBy } from 'lodash';
import { IAction } from 'background/interfaces';

import { ITransaction } from 'interfaces';

interface TransactionState {
  [key: string]: ITransaction
}

const initialState: TransactionState = {};

function transactionReducer (
  state: TransactionState = initialState,
  action: IAction
): TransactionState {
  switch (action.type) {
    case 'TRANSACTION/GETALL/SUCCESS':
      return { ...state, ...keyBy(action.payload, 'txhash') };
    case 'TRANSACTION/CREATE/SUCCESS':
      return { ...state, [action.payload.txhash]: action.payload };
    default:
      return state;
  }
}

export default transactionReducer;
