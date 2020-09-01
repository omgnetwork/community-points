const { Client } = require('pg')

const connectionString = process.env.DATABASE_URL
const accountLease = process.env.DB_ACCOUNT_LEASE_SECONDS || 10

let dbClient
async function getClient () {
  if (!dbClient) {
    dbClient = new Client({ connectionString })
    await dbClient.connect()
  }
  return dbClient
}

function renewReservation (client, account) {
  return client.query(`update fee_accounts set in_use=now() where account='${account}'`)
}

module.exports = {
  init: async function () {
    if (!this.initialised) {
      const client = await getClient()
      await client.query("create table if not exists fee_accounts (account char(42) primary key, in_use timestamp default 'epoch')")
      this.initialised = true
    }
  },

  storeAccounts: async function (accounts) {
    await this.init()

    const client = await getClient()
    return Promise.all(accounts.map(account => client.query(`
      insert into fee_accounts
      values ('${account}', 'epoch')
      on conflict(account)
      do nothing`
    )))
  },

  reserveAccount: async function (account) {
    const client = await getClient()
    const leaseBuffer = 3 // Allow for time taken to renew the reservation
    const res = await client.query(`
      update fee_accounts set in_use=now() 
      where account='${account}' 
      and in_use < now() - interval '${accountLease + leaseBuffer} seconds'`
    )
    const reserved = res.rowCount === 1
    if (reserved) {
      this.intervalID = setInterval(
        () => renewReservation(client, account),
        accountLease * 1000
      )
    }
    return reserved
  },

  releaseAccount: async function (account) {
    if (this.intervalID) {
      clearInterval(this.intervalID)
    }
    const client = await getClient()
    await client.query(`update fee_accounts set in_use='epoch' where account='${account}'`)
    return client.end()
  }
}
