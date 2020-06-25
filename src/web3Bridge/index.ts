import { get } from 'lodash';

window.addEventListener('message', async function (event) {
  const key = get(event, 'data.key', null);
  const payload = get(event, 'data.payload', null);
  if (key !== 'web3Bridge') {
    return;
  }

  if (payload === 'WEB3/ENABLE') {
    const result = await (window as any).ethereum.enable();
    console.log('result: ', result);
  }
});
