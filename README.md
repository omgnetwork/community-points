## Redit Community Points Chrome Extension

This project is a chrome extension used to transfer erc20 reddit community points on the OMG Network.

### User Flow
- User downloads and installs this extension from the chrome store
- Extension checks for a valid metamask instance installed on the browser
- User will register their Ethereum address with the extension
- If the user is on a subreddit, the extension will first check if the subreddit is internally mapped to a community point address.
  - If it is, the extension will load the app and fetch the users community point balance from a Watcher
  - If it is not, the extension will suggest visiting the omg network subreddit
- If the subreddit is valid, the extension shows the user balance and the ability to transfer points to another users address.
- The user will input another users address and amount into the extension
- The extension will make a call to the server to multisig fees
- The extension will then prompt a metamask signing prompt
- The extension will show the transactions pending state and poll for a balance update
- The extension will show a list of past transactions in another tab

### Architecture
- React for the UI, Redux for managing transaction state
