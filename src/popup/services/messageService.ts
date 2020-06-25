export function toBridge ({ type, payload }: { type: string, payload?: any }): void {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, {
      'type': type,
      'payload': payload
    });
  });
}

chrome.runtime.onMessage.addListener(request => {
  if (request.type === 'WEB3/ADDRESS') {
    // todo: persist to redux store
  }
});
