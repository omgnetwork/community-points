import { get } from 'lodash';

// handle messages sent from ui in page context
window.addEventListener('message', async function (event) {
  const key = get(event, 'data.key', null);
  const payload = get(event, 'data.payload', null);
  if (key !== 'to_bridge') {
    return;
  }

  if (payload === 'WEB3/ENABLE') {
    const result = await (window as any).ethereum.enable();
    window.postMessage({
      key: 'from_bridge',
      caller: 'WEB3/ENABLE',
      payload: result
    }, '*');
  }
});
