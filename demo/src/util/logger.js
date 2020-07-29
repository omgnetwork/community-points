const pino = require('pino')({ prettyPrint: true })

const Logger = {
  logBalance: (addressName, tokenName, network, balance) =>
    pino.info(
      `${tokenName} balance for ${addressName} on ${network} is now: ${balance}`
    ),
  logContractAddress: (addressName, address) => {
    pino.info(`${addressName} contract address is: ${address}`)
  },
  logMinting: (caller, amount, tokenSymbol) => {
    pino.info(`${caller} is now minting ${amount} ${tokenSymbol} ...`)
  },
  logTransactionHash: hash => {
    pino.info(`Transaction hash is: ${hash}`)
  },
  logDepositing: (depositor, amount, tokenSymbol) => {
    pino.info(
      `${depositor} is depositing ${amount} ${tokenSymbol} onto the OMG Network.`
    )
  },
  logApprovingErc20: (erc20, amount) => {
    pino.info(`Approving ${amount} ${erc20} for deposit to the OMG Network.`)
  },
  logWaitingForWatcher: () => {
    pino.info('Waiting for transaction to be recorded by the Watcher ...')
  },
  logTransfering: (sender, recipient, amount, tokenSymbol) => {
    pino.info(
      `${sender} is now transfering ${amount} ${tokenSymbol} to ${recipient} on the OMG Network.`
    )
  },
  logConfirmingDeposit: finalityMargin => {
    pino.info(
      `Awaiting ${finalityMargin} blocks to be mined for deposit confirmation ... `
    )
  },
  logDepositConfirmed: () => {
    pino.info('Deposit confirmed.')
  }
}

module.exports = Logger
