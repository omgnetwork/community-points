/* global chrome */
import makeDraggable from 'contentscript/util/makeDraggable';

function injectApp (): void {
  const existingContainer = document.getElementById('omgcp-container');
  if (existingContainer) {
    return;
  }
  const appContainer = document.createElement('div');
  appContainer.id = 'omgcp-container';
  appContainer.style.position = 'fixed';
  appContainer.style.top = '20px';
  appContainer.style.right = '20px';
  appContainer.style.zIndex = '1000000';
  appContainer.style.backgroundColor = 'white';
  appContainer.style.width = '400px';
  appContainer.style.height = '450px';
  appContainer.style.border = '1px solid black';
  appContainer.style.borderRadius = '4px';

  appContainer.innerHTML = `
    <iframe
      id='omgcp-iframe'
      style='
        height:100%;
        width: 100%;
      '
    ></iframe>
    <div
      style='
        position:absolute;
        top:0px;
        left:0px;
        right:0px;
        height: 40px;
        background-color:black;
        color:white;
        cursor:pointer;
        display:flex;
        align-items:center;
      '
      id='omgcp-header'
    >
      <button
        id='omgcp-close-button'
        style='margin-left:10px;'
      >
        𝖷
      </button>
    </div>
  `;

  document.body.appendChild(appContainer);
  const iframeNode = document.getElementById('omgcp-iframe');
  // inject react into iframe
  (iframeNode as any).src = chrome.extension.getURL('app.html');
  const containerNode = document.getElementById('omgcp-container');
  makeDraggable(containerNode, 'omgcp-header');

  const closeNode = document.getElementById('omgcp-close-button');
  closeNode.addEventListener('click', () => {
    appContainer.parentNode.removeChild(appContainer);
  });
}

export default injectApp;
