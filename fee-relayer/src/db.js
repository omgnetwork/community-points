const { Client } = require('pg')

const connectionString = process.env.DATABASE_URL

let dbClient
async function getClient () {
  if (!dbClient) {
    dbClient = new Client({ connectionString })
    await dbClient.connect()
  }
  return dbClient
}

module.exports = {
  init: async function () {
    if (!this.initialised) {
      const client = await getClient()
      await client.query('create table if not exists accounts (account char(42) primary key, in_use boolean default false)')
      this.initialised = true
    }
  },

  storeAccounts: async function (accounts) {
    await this.init()

    const client = await getClient()
    return Promise.all(accounts.map(account => client.query(`
      insert into accounts
      values ('${account}', false)
      on conflict(account)
      do nothing`)
    ))
  },

  reserveAccount: async function (account) {
    const client = await getClient()
    const res = await client.query(`update accounts set in_use=true where account='${account}' and in_use=false`)
    return res.rowCount === 1
  },

  releaseAccount: async function (account) {
    const client = await getClient()
    await client.query(`update accounts set in_use=false where account='${account}'`)
    return client.end()
  }
}
