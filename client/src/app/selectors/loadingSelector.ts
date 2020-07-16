export function selectLoading (requestNames: string[]) {
  return function selectLoadingFromState (state): boolean {
    return requestNames.some(name => state.loading[name]);
  };
}
