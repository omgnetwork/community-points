import Web3 from 'web3';
import JSONBigNumber from 'omg-json-bigint';
import { get } from 'lodash';
import { IMessage } from 'interfaces';

function getProvider () {
  if ((window as any).ethereum) {
    return (window as any).ethereum;
  } else if ((window as any).web3) {
    return (window as any).web3.currentProvider;
  } else {
    return null;
  }
}

function getWeb3 () {
  const provider = getProvider();
  if (provider) {
    return new Web3(
      provider,
      null,
      { transactionConfirmationBlocks: 1 }
    );
  }
}

function respond ({ type, status, payload }: IMessage): void {
  return window.postMessage({
    key: 'from_bridge',
    type,
    status,
    payload
  }, '*');
}

// handle messages sent from ui in page context
window.addEventListener('message', async function (event) {
  const key = get(event, 'data.key', null);
  const type = get(event, 'data.type', null);
  const payload = get(event, 'data.payload', null);

  if (key !== 'to_bridge') {
    return;
  }

  try {
    if (type === 'WEB3/EXISTS') {
      const provider = getProvider();
      return respond({
        type,
        status: 'success',
        payload: !!provider
      });
    }

    if (type === 'WEB3/NETWORK') {
      const web3 = getWeb3();
      const network = await web3.eth.net.getNetworkType();
      return respond({
        type,
        status: 'success',
        payload: network
      });
    }

    if (type === 'WEB3/ACCOUNT') {
      const web3 = getWeb3();
      const allAccounts = await web3.eth.getAccounts();
      const account = allAccounts[0];
      return respond({
        type,
        status: 'success',
        payload: account
      });
    }

    if (type === 'WEB3/ENABLE') {
      if ((window as any).ethereum) {
        await (window as any).ethereum.enable();
        return respond({
          type,
          status: 'success',
          payload: true
        });
      }
      return respond({
        type,
        status: 'success',
        payload: true
      });
    }

    if (type === 'WEB3/SIGN') {
      const web3 = getWeb3();
      try {
        const signature = await web3.currentProvider.send(
          'eth_signTypedData_v3',
          [
            web3.utils.toChecksumAddress(payload.account),
            JSONBigNumber.stringify(payload.typedData)
          ]
        );
        return respond({
          type,
          status: 'success',
          payload: signature
        });
      } catch (error) {
        return respond({
          type,
          status: 'error',
          payload: error.message
        });
      }
    }
  } catch (error) {
    // TODO: send to sentry
    console.warn('UNCAUGHT ERROR ON BRIDGE: ', error.message);
    return respond({
      type,
      status: 'error',
      payload: error.message
    });
  }
});
