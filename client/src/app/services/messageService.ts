/* global chrome */
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
          chrome.runtime.onMessage.removeListener(messageListener);
          if (message.status === 'success') {
            return resolve(message.payload);
          }
          if (message.status === 'error') {
            return reject(new Error(message.payload));
          }
        }
      }
    );
  });
}
