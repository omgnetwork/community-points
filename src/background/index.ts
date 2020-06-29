/* global chrome */
import { wrapStore } from 'webext-redux';
import { createStore } from 'redux';

import rootReducer from 'background/reducers/rootReducer';

const initialState = {};
const store = createStore(
  rootReducer,
  initialState
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

console.log('omgcp background initialized...');
