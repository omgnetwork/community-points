import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import Main from 'app/main/Main';
import store from 'app/store';

store.ready().then(() => {
  ReactDOM.render(
    <Provider store={store}>
      <Main />
    </Provider>,
    document.getElementById('omgcp-root')
  );
});
