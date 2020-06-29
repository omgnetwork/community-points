import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Store } from 'webext-redux';

import Main from 'app/main/Main';

const store = new Store({
  portName: 'omgcp-port'
});

ReactDOM.render(
  <Provider store={store}>
    <Main />
  </Provider>,
  document.getElementById('omgcp-root')
);
