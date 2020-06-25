import { get } from 'lodash';

window.addEventListener('message', function (event) {
  const key = get(event, 'data.key', null);
  const payload = get(event, 'data.payload', null);
  if (key !== 'web3Bridge') {
    return;
  }

  if (payload === 'WEB3/ENABLE') {
    (window as any).ethereum.enable();
  }
});
