import { combineReducers } from 'redux';

import { IAction } from 'background/interfaces';
import appReducer from 'background/reducers/appReducer';

const allReducers = combineReducers({
  app: appReducer
});

function rootReducer (state, action: IAction) {
  if (action.type === 'ROOT/FLUSH') {
    state = undefined;
  }
  return allReducers(state, action);
}

export default rootReducer;
