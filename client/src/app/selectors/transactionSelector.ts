import { orderBy, get } from 'lodash';

import { logAmount } from 'app/util/amountConvert';
import { ITransaction, IFlairMap } from 'interfaces';

export function selectTransactions (state): ITransaction[] {
  const transactions: ITransaction[] = Object.values(state.transaction);
  return orderBy(transactions, ['timestamp'], ['desc']);
}

export function selectIsPendingTransaction (state): boolean {
  const transactions: ITransaction[] = Object.values(state.transaction);
  return transactions.some((tx: ITransaction) => tx.status === 'Pending');
}

export function selectPurchasedFlairs (state): IFlairMap {
  const transactions: ITransaction[] = Object.values(state.transaction);
  const flairAddress = get(state, 'session.subReddit.flairAddress', null);
  const flairMap: IFlairMap = get(state, 'session.subReddit.flairMap', {});

  const flairPurchases: ITransaction[] = transactions.filter(i => {
    if (i.direction === 'incoming') {
      return false;
    }
    if (!flairMap[i.metadata]) {
      return false;
    }
    if (flairMap[i.metadata].price.toString() !== logAmount(i.amount, i.decimals)) {
      return false;
    }
    if (i.recipient.toLowerCase() !== flairAddress.toLowerCase()) {
      return false;
    }
    return true;
  });

  const purchasedFlairs = {};
  flairPurchases.forEach(purchase => {
    if (flairMap[purchase.metadata]) {
      purchasedFlairs[purchase.metadata] = flairMap[purchase.metadata];
    }
  });

  return purchasedFlairs;
}
