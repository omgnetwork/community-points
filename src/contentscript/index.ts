function injectWeb3Bridge() {
  const script = document.createElement('script');
  const bridge = chrome.extension.getURL('web3Bridge.js');

  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', bridge);

  const node = document.getElementsByTagName('body')[0];
  node.appendChild(script);
}

// listen to ui messages and forward them to injected script
chrome.runtime.onMessage.addListener(request => {
  window.postMessage({
    key: 'web3Bridge',
    payload: request.payload
  }, '*');
});

injectWeb3Bridge();
