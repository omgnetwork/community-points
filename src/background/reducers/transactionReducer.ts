import { keyBy, find } from 'lodash';
import { IAction } from 'background/interfaces';

interface TransactionState {
  [key: string]: any
}

const initialState: TransactionState = {};

function transactionReducer (
  state: TransactionState = initialState,
  action: IAction
): TransactionState {
  if (action.type === 'TRANSACTION/GETALL/SUCCESS') {
    // TODO: add below to state from Home
    const subRedditToken = state.app.subReddit.token;
    const userAddress = state.app.userAddress;

    const allTransactions = action.payload;
    const inboundTransactions = [];
    const outboundTransactions = [];

    allTransactions.forEach(transaction => {
      // - filter only the currency we care about
      // - if currency is not in inputs or outputs it's not a transaction we care about
      const inInputs = find(transaction.inputs, i => {
        return i.currency === subRedditToken;
      });
      const inOutputs = find(transaction.outputs, i => {
        return i.currency === subRedditToken;
      });
      if (!inInputs || !inOutputs) {
        return;
      }

      // - sort outbound and inbound transactions
      // - if one of the inputs owner and currency match it is outbound
      // - if owner not in input, but currency and owner in output, it is inbound
      console.log('TODO: sort inbound/outbound');

      // - add amount & recipient
      // - for outbound, sum amount of currency going to recipient in outputs
      // - for inbound, sum amount of currency coming to us in outputs
      console.log('TODO: enhance');
    });

    const transactions = [];
    return { ...state, ...keyBy(transactions, 'txhash') };
  }

  if (action.type === 'TRANSACTION/CREATE/SUCCESS') {
    return { ...state, [action.payload.txhash]: action.payload };
  }

  return state;
}

export default transactionReducer;
