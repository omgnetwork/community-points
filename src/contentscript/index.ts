import { get } from 'lodash';
import { IMessage } from 'interfaces';

// listen to ui messages and forward them to bridge
chrome.runtime.onMessage.addListener((message: Partial<IMessage>) => {
  window.postMessage({
    key: 'to_bridge',
    type: message.type,
    payload: message.payload
  }, '*');
});

// listen to bridge messages and forward them to ui
window.addEventListener('message', async function (event) {
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
});

// bridge injection
function injectBridge (): void {
  const bridge = chrome.extension.getURL('bridge.js');
  const script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', bridge);

  const node = document.getElementsByTagName('body')[0];
  node.appendChild(script);
}

injectBridge();
