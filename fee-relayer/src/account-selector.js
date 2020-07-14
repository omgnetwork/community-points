const db = require('./db')

let accounts = []

async function canUse(account) {
  if (process.env.FEE_RELAYER_USE_DB === 'true') {
    return db.canUse(account.address)
  }
  return true
}

module.exports = {
  setAccounts: async (acs) => {
    accounts = acs
    if (process.env.FEE_RELAYER_USE_DB === 'true') {
      db.storeAccounts(accounts.map(account => account.address))
    }
  },

  getAccount: async () => {
    for (let i = 0; i < accounts.length; i++) {
      if (await canUse(accounts[i])) {
        return accounts[i];
      }
    }

    throw new Error('No usable account!')
  }
}
