import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Store, applyMiddleware } from 'webext-redux';
import reduxThunk from 'redux-thunk';

import Main from 'app/main/Main';

const _store = new Store({ portName: 'omgcp-port' });
const store = applyMiddleware(
  _store,
  reduxThunk
);

store.ready().then(() => {
  ReactDOM.render(
    <Provider store={store}>
      <Main />
    </Provider>,
    document.getElementById('omgcp-root')
  );
});
