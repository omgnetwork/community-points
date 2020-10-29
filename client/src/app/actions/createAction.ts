import * as errorService from 'app/services/errorService';

export function createAction (
  key: string,
  asyncAction: Function,
  customErrorMessage?: string
) {
  return async function dispatchCreateAction (dispatch) {
    try {
      dispatch({ type: `${key}/REQUEST` });
      const response = await asyncAction();
      dispatch({ type: `${key}/SUCCESS`, payload: response });
      return true;
    } catch (error) {
      // check if because extension context is invalid
      const isInvalidContext = errorService.invalidExtensionContext(error);
      if (isInvalidContext) {
        // will force loading view and prompt for required refresh
        window.location.reload(false);
        return false;
      }

      // cancel loading state
      dispatch({ type: `${key}/ERROR` });

      // sanitize false negatives
      const shouldSilence = errorService.shouldSilence(error);
      if (shouldSilence) {
        return false;
      }

      // busy server, no sentry reporting, only ui
      const busyServer = errorService.busyServer(error);
      if (busyServer) {
        dispatch({ type: 'UI/ERROR/UPDATE', payload: 'Sorry, the server is busy, please try again in a few minutes.' });
        return false;
      }

      // unexpected error to log to sentry
      dispatch({ type: 'UI/ERROR/UPDATE', payload: customErrorMessage || error.message });
      errorService.log(error);
      return false;
    }
  };
}
