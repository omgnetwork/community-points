const db = require('./db')

const USE_DB = process.env.FEE_RELAYER_USE_DB === 'true'

async function canUse(account) {
  if (USE_DB) {
    return db.reserveAccount(account.address)
  }
  return true
}

async function findAvailableAccount(accounts) {
  for (let i = 0; i < accounts.length; i++) {
    if (await canUse(accounts[i])) {
      return accounts[i]
    }
  }

  throw new Error('No available fee payer account!')
}

module.exports = {
  setAccounts: async function (acs) {
    this.accounts = acs
    if (USE_DB) {
      db.storeAccounts(this.accounts.map(account => account.address))
    }
  },

  getAccount: async function () {
    if (!this.accountInUse) {
      this.accountInUse = findAvailableAccount(this.accounts)
    }
    return this.accountInUse
  },

  onExit: async function () {
    if (USE_DB) {
      return db.releaseAccount(this.accountInUse.address)
    }
  }
}
