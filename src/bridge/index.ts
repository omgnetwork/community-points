import { get } from 'lodash';

// handle messages sent from ui in page context
window.addEventListener('message', async function (event) {
  const key = get(event, 'data.key', null);
  const type = get(event, 'data.type', null);
  const payload = get(event, 'data.payload', null);

  if (key !== 'to_bridge') {
    return;
  }

  if (type === 'WEB3/ENABLE') {
    const result = await (window as any).ethereum.enable();
    window.postMessage({
      key: 'from_bridge',
      type,
      payload: result
    }, '*');
  }

  if (type === 'WEB3/TRANSFER') {
    console.log('do omg transfer: ', payload);
    // TODO: decide where to create the transaction
    // everything in the bridge? or just use the bridge for the sign prompt?
  }
});
