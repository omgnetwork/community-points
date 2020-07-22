const { Pool } = require('pg')

const connectionString = process.env.DATABASE_URL

let pool
function getPool () {
  if (!pool) {
    pool = new Pool({ connectionString })
  }
  return pool
}

module.exports = {
  init: async function () {
    if (!this.initialised) {
      await getPool().query('create table if not exists accounts (account char(42) primary key, in_use boolean default false)')
      this.initialised = true
    }
  },

  storeAccounts: async function (accounts) {
    await this.init()

    return Promise.all(accounts.map(account => getPool().query(`
      insert into accounts
      values ('${account}', false)
      on conflict(account)
      do nothing`)
    ))
  },

  reserveAccount: async function (account) {
    const res = await getPool().query(`update accounts set in_use=true where account='${account}' and in_use=false`)
    return res.rowCount === 1
  },

  releaseAccount: async function (account) {
    return getPool().query(`update accounts set in_use=false where account='${account}'`)
  }
}
