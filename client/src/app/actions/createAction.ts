import * as errorService from 'app/services/errorService';

export function createAction (
  key: string,
  asyncAction: Function,
  customErrorMessage?: string
) {
  return async function dispatchCreateAction (dispatch) {
    dispatch({ type: `${key}/REQUEST` });
    try {
      const response = await asyncAction();
      dispatch({ type: `${key}/SUCCESS`, payload: response });
      return true;
    } catch (error) {
      // cancel loading state
      dispatch({ type: `${key}/ERROR` });

      // sanitize expected errors
      const expectedError = errorService.isExpectedError(error);
      if (expectedError) {
        return false;
      }

      // handle busy fee relayer
      if (error.message && error.message.includes('Insufficient funds to cover fee amount')) {
        // pass custom message to ui
        dispatch({ type: 'UI/ERROR/UPDATE', payload: 'Server is busy, please try again later' });
        return false;
      }

      // pass error message to ui
      dispatch({ type: 'UI/ERROR/UPDATE', payload: customErrorMessage || error.message });
      errorService.log(error);
      return false;
    }
  };
}
