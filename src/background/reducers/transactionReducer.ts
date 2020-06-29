import { keyBy } from 'lodash';
import { IAction } from 'background/interfaces';

interface TransactionState {
  [key: string]: any
}

const initialState: TransactionState = {};

function transactionReducer (
  state: TransactionState = initialState,
  action: IAction
): TransactionState {
  switch (action.type) {
    case 'TRANSACTION/CREATE/SUCCESS':
      return { ...state, [action.payload.txhash]: action.payload };
    case 'TRANSACTION/GETALL/SUCCESS':
      return { ...state, ...keyBy(action.payload, 'txhash') };
    default:
      return state;
  }
}

export default transactionReducer;
