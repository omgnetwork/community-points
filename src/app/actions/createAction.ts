export function createAction (
  key: string,
  asyncAction: Function,
  customErrorMessage: string
) {
  return async function (dispatch) {
    dispatch({ type: `${key}/REQUEST` });
    try {
      const response = await asyncAction();
      dispatch({ type: `${key}/SUCCESS`, payload: response });
      return true;
    } catch (error) {
      dispatch({ type: `${key}/ERROR`, payload: customErrorMessage || error.message });
      return false;
    }
  };
}
