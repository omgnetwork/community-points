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
wrapStore(store, { portName: 'omgcp-port' });

chrome.browserAction.onClicked.addListener(
  function onBrowserAction () {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'BROWSERACTION/SHOW' });
    });
  }
);

chrome.contextMenus.onClicked.addListener(
  function onContextMenu () {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'BROWSERACTION/SHOW' });
    });
  }
);

chrome.contextMenus.create({
  id: 'omgcp-contextmenu',
  title: 'OMG Network Community Points',
  contexts: ['all']
});
