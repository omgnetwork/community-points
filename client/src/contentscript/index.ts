/* global chrome */
import { get } from 'lodash';

import { IMessage } from 'interfaces';
import injectApp from 'contentscript/elements/injectApp';
import injectBridge from 'contentscript/elements/injectBridge';

// listen to ui messages and forward them to bridge
chrome.runtime.onMessage.addListener(
  function onMessageListener (message: Partial<IMessage>): void {
    if (message.type === 'PAGEACTION/CLICKED') {
      return injectApp();
    }

    return window.postMessage({
      key: 'to_bridge',
      type: message.type,
      payload: message.payload
    }, '*');
  }
);

// listen to bridge messages and forward them to ui
window.addEventListener(
  'message',
  async function bridgeMessageEventListener (event): Promise<void> {
    const key = get(event, 'data.key', null);
    const type = get(event, 'data.type', null);
    const status = get(event, 'data.status', null);
    const payload = get(event, 'data.payload', null);

    if (key !== 'from_bridge') {
      return;
    }

    chrome.runtime.sendMessage({
      type,
      status,
      payload
    });
  }
);

injectBridge();
chrome.runtime.sendMessage({ type: 'PAGEACTION/SHOW' });
