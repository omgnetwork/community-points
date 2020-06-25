import { wrapStore, alias } from 'webext-redux';
import { createStore, applyMiddleware } from 'redux';
import reduxThunk from 'redux-thunk';

import rootReducer from 'background/reducers/rootReducer';
import aliases from 'background/aliases';

const initialState = {};

const store = createStore(
  rootReducer,
  initialState,
  applyMiddleware(
    alias(aliases),
    reduxThunk
  )
);

console.log('background page booted');
console.log((window as any).ethereum);
export default wrapStore(
  store,
  { portName: 'omgnetwork-community-points' }
);
