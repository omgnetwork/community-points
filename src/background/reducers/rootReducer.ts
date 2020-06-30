import { combineReducers } from 'redux';

import { IAction } from 'background/interfaces';
import appReducer from 'background/reducers/appReducer';
import loadingReducer from 'background/reducers/loadingReducer';
import transactionReducer from 'background/reducers/transactionReducer';
import sessionReducer from 'background/reducers/sessionReducer';

const allReducers = combineReducers({
  app: appReducer,
  loading: loadingReducer,
  transaction: transactionReducer,
  session: sessionReducer
});

function rootReducer (state, action: IAction) {
  console.log('reducer: ', action);

  if (action.type === 'ROOT/FLUSH') {
    state = undefined;
  }
  return allReducers(state, action);
}

export default rootReducer;
