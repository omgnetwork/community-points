## Reddit Wallet - Chrome Extension

This project is a Chrome extension used to transfer Reddit community points directly in the browser. It is powered by the OMG Network.

### Architecture

- Extensions are sandboxed javascript runtimes so we do not have direct access to the context of other scripts. We utilize Chrome's built in messaging to be able to communicate with the context of the page.

- Components
  - app.js - the user interface
  - contentScript.js - injects bridge and forwards messages from user interface
  - bridge.js - listens for messages from the contentScript and interacts with the web3 provider in the context of the dom
  - background.js - listens to user actions and persists state

### Commands

- `nvm use` switch to correct node version
- `yarn install` install project dependencies
- `yarn build:dev` or `yarn build:prod` compile extension bundle
- `yarn lint` runs linter
- `yarn test` runs tests
- `yarn release` prepare bundle for release

### Installation

- Find the latest version from the [releases page](https://github.com/omgnetwork/community-points/releases)
- Download and unzip the `Release_vX.X.X.zip` bundle found in the `Assets` section
- In a Chrome based browser (Brave or Chrome), open `Extensions` (brave:://extensions or chrome:://extensions) in `Developer mode`, and click `Load unpacked` and select the folder you just unzipped
- Visit a supported subreddit and transfer!

### SubReddit Support

- This extension keeps a map of subreddit names to erc20 addresses in `client/src/subRedditMap.ts`. To add support for another subreddit, a PR should be made modifying this file.
