## Redit Community Points Chrome Extension

This project is a Chrome extension used to transfer reddit community points on the OMG Network.

### Architecture

- Extensions are sandboxed javascript runtimes so we do not have direct access to the context of other scripts. We utilize Chrome's built in messaging to be able to communicate with the context of the page.

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

### SubReddit Support

- This extension keeps a map of subreddit names to erc20 addresses in `subRedditMap.ts`. To add support for another subreddit, a PR should be made modifying this file.
