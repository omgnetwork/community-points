export async function send ({
  type,
  payload
} : { type: string, payload?: any }): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, {
          'type': type,
          'payload': payload
        });
      });

      chrome.runtime.onMessage.addListener(request => {
        if (request.type === type) {
          resolve(request.payload);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}
