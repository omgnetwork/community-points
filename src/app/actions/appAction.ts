export function initializeApp () {
  return function (dispatch) {
    return dispatch({ type: 'APP/BOOT/SUCCESS' });
  };
}
