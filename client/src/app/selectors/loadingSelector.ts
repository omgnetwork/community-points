export function selectLoading (requestNames: string[]) {
  return function (state): boolean {
    return requestNames.some(name => state.loading[name]);
  };
}
