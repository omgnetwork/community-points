import { combineReducers } from 'redux';

import { IAction } from 'interfaces';

import loadingReducer from 'background/reducers/loadingReducer';
import transactionReducer from 'background/reducers/transactionReducer';
import sessionReducer from 'background/reducers/sessionReducer';
import addressReducer from 'background/reducers/addressReducer';
import uiReducer from 'background/reducers/uiReducer';
import configReducer from 'background/reducers/configReducer';

const allReducers = combineReducers({
  loading: loadingReducer,
  transaction: transactionReducer,
  session: sessionReducer,
  address: addressReducer,
  ui: uiReducer,
  config: configReducer
});

function rootReducer (state, action: IAction) {
  if (action.type === 'ROOT/FLUSH') {
    state = undefined;
  }
  return allReducers(state, action);
}

export default rootReducer;
