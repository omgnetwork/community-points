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

chrome.runtime.onMessage.addListener(
  function onMessageListener (message, sender, _): void {
    if (message.type === 'PAGEACTION/SHOW') {
      chrome.pageAction.show(sender.tab.id);
    }
  }
);

chrome.pageAction.onClicked.addListener(
  function onPageAction (): void {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'PAGEACTION/CLICKED' });
    });
  }
);

chrome.contextMenus.onClicked.addListener(
  function onContextMenu (): void {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'PAGEACTION/CLICKED' });
    });
  }
);

chrome.contextMenus.create({
  id: 'omgcp-contextmenu',
  title: 'Community Points Engine',
  contexts: ['all']
});
