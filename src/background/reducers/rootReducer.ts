import { combineReducers } from 'redux';

import { IAction } from 'background/interfaces';
import appReducer from 'background/reducers/appReducer';
import loadingReducer from 'background/reducers/loadingReducer';
import transactionReducer from 'background/reducers/transactionReducer';

const allReducers = combineReducers({
  app: appReducer,
  loading: loadingReducer,
  transaction: transactionReducer
});

function rootReducer (state, action: IAction) {
  console.log('reducer: ', action);

  if (action.type === 'ROOT/FLUSH') {
    state = undefined;
  }
  return allReducers(state, action);
}

export default rootReducer;
