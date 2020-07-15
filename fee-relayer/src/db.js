const { Pool } = require('pg')

let pool
function getPool () {
  if (!pool) {
    pool = new Pool()
  }
  return pool
}

module.exports = {
  storeAccounts: async (accounts) => {
    return Promise.all(accounts.map(account => getPool().query(`
      insert into accounts
      values ('${account}', false)
      on conflict(account)
      do nothing`)
    ))
  },

  reserveAccount: async (account) => {
    const res = await getPool().query(`update accounts set in_use=true where account='${account}' and in_use=false`)
    return res.rowCount === 1
  },

  releaseAccount: async (account) => {
    return getPool().query(`update accounts set in_use=false where account='${account}'`)
  }
}
