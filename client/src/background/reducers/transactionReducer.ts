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
      if (action.payload.length) {
        return {
          ...state,
          [action.payload[0].user]: {
            ...state[action.payload[0].user],
            ...keyBy(action.payload, 'txhash')
          }
        };
      }
      return state;
    case 'TRANSACTION/CREATE/SUCCESS':
      return {
        ...state,
        [action.payload.user]: {
          ...state[action.payload.user],
          [action.payload.txhash]: action.payload
        }
      };
    default:
      return state;
  }
}

export default transactionReducer;
