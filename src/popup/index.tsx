import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Store } from 'webext-redux';

import Main from 'popup/main/Main';

const store = new Store({
  portName: 'omgnetwork-community-points'
});

ReactDOM.render(
  <Provider store={store}>
    <Main />
  </Provider>,
  document.getElementById('root')
);
