## Redit Community Points Chrome Extension

This project is a Chrome extension used to transfer reddit community points on the OMG Network.

### User Flow

- User downloads and installs this extension from the store
- Extension checks for a valid metamask instance installed on the browser
- If the user is on a subreddit, the extension will first check if the subreddit is internally mapped to a community point address.
  - If it is, the extension will load the app and fetch the users community point balance from a Watcher
- If the subreddit is valid, the extension shows the user balance and the ability to transfer points to another users address.
- The user will input another users address and amount into the extension
- The extension will make a call to the server to multisig fees
- The extension will then prompt a metamask signing prompt
- The extension will show the transactions pending state and poll for a balance update
- The extension will show a list of past transactions in another tab

### Architecture

- Extensions are sandboxed javascript runtimes so we do not have direct access to the context of other scripts. Since it is a requirement for this application to communicate with an injected web3 provider, we utilize Chrome's built in messaging to be able to communicate with the context of the page.

- Components
  - popup.js - manage ui and proxy store
  - contentScript.js - injects bridge and forwards messages from ui
  - bridge.js - has access to the context of the page, listening for messages from the contentScript and interacting with the web3 provider
  - background.js - redux store used to persist app state across the browser

### Development

- `nvm use` switch to correct node version
- `yarn install` install project dependencies
- `yarn build` compile extension bundle
- `yarn lint` runs linter
- `yarn test` runs tests

- in a Chrome based browser, open extensions in `Developer mode`, and `Load unpacked` pointing to this projects `build` folder
