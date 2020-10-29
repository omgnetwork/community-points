import { orderBy, get } from 'lodash';

import { logAmount } from 'app/util/amountConvert';
import { ITransaction, IFlairMap } from 'interfaces';

export function selectTransactions (state): ITransaction[] {
  if (state.session.account) {
    const transactions: ITransaction[] = Object.values(state.transaction[state.session.account] || {});
    return orderBy(transactions, ['timestamp'], ['desc']);
  }
  return [];
}

export function selectIsPendingTransaction (state): boolean {
  if (state.session.account) {
    const transactions: ITransaction[] = Object.values(state.transaction[state.session.account] || {});
    return transactions.some((tx: ITransaction) => tx.status === 'Pending');
  }
  return false;
}

export function selectPurchasedFlairs (state): IFlairMap {
  const transactions: ITransaction[] = state.session.account
    ? Object.values(state.transaction[state.session.account] || {})
    : [];
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
