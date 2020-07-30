import { Store, applyMiddleware } from 'webext-redux';
import reduxThunk from 'redux-thunk';

const _store = new Store({ portName: 'omgcp-port' });
const store = applyMiddleware(
  _store,
  reduxThunk
);

export default store;
