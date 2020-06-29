import { IMessage } from 'interfaces';

export async function send ({
  type,
  payload
} : Partial<IMessage>): Promise<any> {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.tabs.sendMessage(tabs[0].id, {
        'type': type,
        'payload': payload
      });
    });

    chrome.runtime.onMessage.addListener(
      function messageListener (message: IMessage) {
        if (message.type === type) {
          if (message.status === 'success') {
            chrome.runtime.onMessage.removeListener(messageListener);
            return resolve(message.payload);
          }
          if (message.status === 'error') {
            chrome.runtime.onMessage.removeListener(messageListener);
            return reject(message.payload);
          }
        }
      }
    );
  });
}
