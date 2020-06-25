import { get } from 'lodash';

function injectWeb3Bridge() {
  const script = document.createElement('script');
  const bridge = chrome.extension.getURL('web3Bridge.js');

  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', bridge);

  const node = document.getElementsByTagName('body')[0];
  node.appendChild(script);
}

// listen to ui messages and forward them to bridge
chrome.runtime.onMessage.addListener(request => {
  window.postMessage({
    key: 'to_web3Bridge',
    payload: request.payload
  }, '*');
});

// listen to bridge messages and forward them to ui
window.addEventListener('message', async function (event) {
  const key = get(event, 'data.key', null);
  const payload = get(event, 'data.payload', null);
  const caller = get(event, 'data.caller', null);
  if (key !== 'from_web3Bridge') {
    return;
  }

  if (caller === 'WEB3/ENABLE') {
    console.log('payload received from web3: ', payload);
  }
});

injectWeb3Bridge();
