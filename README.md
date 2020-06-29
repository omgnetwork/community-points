## Reddit Community Points Chrome Extension

This project is a Chrome extension used to transfer Reddit community points on the OMG Network.

### Architecture

- Extensions are sandboxed javascript runtimes so we do not have direct access to the context of other scripts. We utilize Chrome's built in messaging to be able to communicate with the context of the page.

- Components
  - app.js - the application
  - contentScript.js - injects bridge and forwards messages from ui
  - bridge.js - listening for messages from the contentScript and interacting with the injected web3 provider
  - background.js - listens to user actions and has persisted redux store

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
