import { orderBy } from 'lodash';

import { ITransaction } from 'interfaces';

export function selectTransactions (state): ITransaction[] {
  const transactions: ITransaction[] = Object.values(state.transaction);
  return orderBy(transactions, ['timestamp'], ['desc']);
}

export function selectIsPendingTransaction (state): boolean {
  const transactions: ITransaction[] = Object.values(state.transaction);
  return transactions.some((tx: ITransaction) => tx.status === 'Pending');
}
