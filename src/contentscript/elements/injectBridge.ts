function injectBridge (): void {
  const bridgeSrc = chrome.extension.getURL('bridge.js');
  const bridgeScript = document.createElement('script');
  bridgeScript.setAttribute('type', 'text/javascript');
  bridgeScript.setAttribute('src', bridgeSrc);

  const bodyNode = document.getElementsByTagName('body')[0];
  bodyNode.appendChild(bridgeScript);
}

export default injectBridge;
