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
  appContainer.style.backgroundColor = '#FFFFFF';
  appContainer.style.width = '400px';
  appContainer.style.height = '500px';
  appContainer.style.borderRadius = '8px';
  appContainer.style.boxShadow = '0px 0px 29px -8px rgba(0,0,0,0.5)';

  appContainer.innerHTML = `
    <iframe
      id='omgcp-iframe'
      style='
        height: 100%;
        width: 100%;
      '
    ></iframe>
    <div
      style='
        position: absolute;
        top: 0px;
        left: 0px;
        right: 0px;
        height: 40px;
        background-color: #101010;
        color: #FFFFFF;
        cursor: move;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding: 0px 20px;
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
        font-weight: bold;
      '
      id='omgcp-header'
    >
      <span>
        Community Points Engine
      </span>
      <button id='omgcp-close-button'>
        𝖷
      </button>
    </div>
  `;

  document.body.appendChild(appContainer);
  const iframeNode: Partial<HTMLIFrameElement> = document.getElementById('omgcp-iframe');
  // inject react into iframe
  iframeNode.src = chrome.extension.getURL('app.html');
  const containerNode = document.getElementById('omgcp-container');
  makeDraggable(containerNode, 'omgcp-header');

  const closeNode = document.getElementById('omgcp-close-button');
  closeNode.addEventListener('click', () => {
    appContainer.parentNode.removeChild(appContainer);
  });
}

export default injectApp;
