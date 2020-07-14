import { combineReducers } from 'redux';

import { IAction } from 'interfaces';

import loadingReducer from 'background/reducers/loadingReducer';
import transactionReducer from 'background/reducers/transactionReducer';
import sessionReducer from 'background/reducers/sessionReducer';
import addressReducer from 'background/reducers/addressReducer';

const allReducers = combineReducers({
  loading: loadingReducer,
  transaction: transactionReducer,
  session: sessionReducer,
  address: addressReducer
});

function rootReducer (state, action: IAction) {
  if (action.type === 'ROOT/FLUSH') {
    state = undefined;
  }
  return allReducers(state, action);
}

export default rootReducer;
