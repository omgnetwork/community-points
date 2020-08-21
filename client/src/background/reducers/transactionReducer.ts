import { keyBy } from 'lodash';
import { ITransaction, IAction } from 'interfaces';

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
    case 'TRANSACTION/CLEAR/SUCCESS':
      return {};
    default:
      return state;
  }
}

export default transactionReducer;
