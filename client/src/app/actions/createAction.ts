import * as errorService from 'app/services/errorService';

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

      // if user denied, ignore
      if (error.message && error.message.includes('User denied')) {
        return false;
      }

      // pass error message to ui
      dispatch({ type: 'UI/ERROR/UPDATE', payload: customErrorMessage || error.message });

      errorService.log(error);
      return false;
    }
  };
}
