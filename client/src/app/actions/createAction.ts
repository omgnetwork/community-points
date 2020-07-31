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

      // sanitize false negatives
      const shouldSilence = errorService.shouldSilence(error);
      if (shouldSilence) {
        return false;
      }

      // expected errors, no sentry reporting, only ui
      const expectedError = errorService.expectedError(error);
      if (expectedError) {
        dispatch({ type: 'UI/ERROR/UPDATE', payload: 'Server is busy, please try again later' });
        return false;
      }

      // unexpected error to log to sentry
      dispatch({ type: 'UI/ERROR/UPDATE', payload: customErrorMessage || error.message });
      errorService.log(error);
      return false;
    }
  };
}
