import { orderBy } from 'lodash';

export function selectTransactions (state) {
  const transactions = Object.values(state.transaction);
  return orderBy(transactions, ['timestamp'], ['desc']);
}
