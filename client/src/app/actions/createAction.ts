export function createAction (
  key: string,
  asyncAction: Function,
  customErrorMessage?: string
) {
  return async function (dispatch) {
    dispatch({ type: `${key}/REQUEST` });
    try {
      const response = await asyncAction();
      dispatch({ type: `${key}/SUCCESS`, payload: response });
      return true;
    } catch (error) {
      // cancel loading state
      dispatch({ type: `${key}/ERROR` });

      // TODO: sanitize errors

      // pass error message to ui
      dispatch({ type: 'UI/ERROR/UPDATE', payload: customErrorMessage || error.message });

      // TODO: pass error to sentry
      return false;
    }
  };
}
