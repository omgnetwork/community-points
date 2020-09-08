export function selectError (state): string {
  return state.ui.error;
}

export function selectTransactionsFetched (state): boolean {
  return state.ui.transactionsFetched;
}
