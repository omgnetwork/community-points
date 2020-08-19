## Reddit Wallet - Chrome Extension

This project is a Chrome extension used to transfer community points directly in the browser. It is powered by the OMG Network.

### Commands

- `nvm use` switch to correct node version
- `yarn install` install project dependencies
- `yarn build:dev` or `yarn build:prod` compile extension bundle
- `yarn lint` runs linter
- `yarn test` runs tests
- `yarn release` prepare bundle for release

### Development

- create a `.env` file with values shown in `.env.template`
- `yarn install` to install dependencies
- `yarn build:dev` to compile application
- in a Chrome based browser (Brave or Chrome), open `Extensions` (brave:://extensions or chrome:://extensions) in `Developer mode`, and click `Load unpacked` and select the `build` folder
