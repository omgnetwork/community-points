import { IMessage } from 'interfaces';

export async function send ({
  type,
  payload
} : Partial<IMessage>): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, {
          'type': type,
          'payload': payload
        });
      });

      chrome.runtime.onMessage.addListener((message: IMessage) => {
        if (message.type === type) {
          if (message.status === 'success') {
            resolve(message.payload);
          }
          if (message.status === 'error') {
            reject(message.payload);
          }
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}
