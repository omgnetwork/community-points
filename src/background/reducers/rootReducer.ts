import { combineReducers } from 'redux';

import { IAction } from 'background/interfaces';
import appReducer from 'background/reducers/appReducer';
import loadingReducer from 'background/reducers/loadingReducer';
import transferReducer from 'background/reducers/transferReducer';

const allReducers = combineReducers({
  app: appReducer,
  loading: loadingReducer,
  transfer: transferReducer
});

function rootReducer (state, action: IAction) {
  console.log('reducer: ', action);

  if (action.type === 'ROOT/FLUSH') {
    state = undefined;
  }
  return allReducers(state, action);
}

export default rootReducer;
