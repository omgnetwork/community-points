import { combineReducers } from 'redux';

import { IAction } from 'background/interfaces';
import appReducer from 'background/reducers/appReducer';
import loadingReducer from 'background/reducers/loadingReducer';

const allReducers = combineReducers({
  app: appReducer,
  loading: loadingReducer
});

function rootReducer (state, action: IAction) {
  if (action.type === 'ROOT/FLUSH') {
    state = undefined;
  }
  return allReducers(state, action);
}

export default rootReducer;
