## Reddit Wallet - Chrome Extension

This project is a Chrome extension used to transfer Reddit community points directly in the browser. It is powered by the OMG Network.

### Architecture

- Extensions are sandboxed javascript runtimes so we do not have direct access to the context of other scripts. We utilize Chrome's built in messaging to be able to communicate with the context of the page.

- Components
  - app.js - the user interface
  - contentScript.js - injects bridge and forwards messages from user interface
  - bridge.js - listens for messages from the contentScript and interacts with the web3 provider in the context of the dom
  - background.js - listens to user actions and persists state

### Development

- `nvm use` switch to correct node version
- `yarn install` install project dependencies
- `yarn build:dev` compile extension bundle
- `yarn lint` runs linter
- `yarn test` runs tests

- in a Chrome based browser, open extensions in `Developer mode`, and `Load unpacked` pointing to this projects `build` folder

### Production

- `yarn build:prod` to compile production bundle

### SubReddit Support

- This extension keeps a map of subreddit names to erc20 addresses in `subRedditMap.ts`. To add support for another subreddit, a PR should be made modifying this file.
