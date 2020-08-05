## Flair

job scheduler that updates user flair based on purchases they have made on the OMG Network

### Getting Started

To install dependencies run `npm install` in the root directory

To start the job run `npm run start` in the root directory

To test the application run `npm rest` in the root directory

### Environment Variables

The application supports the following environment variables, you may refer to env.template file for reference

```
BURN_ADDR=<address used to burn ERC20 token points for purchased assets>
CURRENCY=<ERC20 token points contract address>
WATCHER=<URL of the Watcher info>
USER_THREAD=<URL and path to the Reddit thread that contains a list of usernames>
USER_AGENT=<describes your node application name>
CLIENT_ID=<client ID of the Reddit application, obtained from Reddit developer portal>
CLIENT_SECRET=<client secret of the Reddit application, obtained from Reddit developer portal>
USERNAME=<Reddit username, must be listed as a moderator on the Reddit Sub with flair access>
PASSWORD=<Reddit password>
SUB=<Name of the sub>

```
