const BigNumber = require('bignumber.js')

const subunitToUnit = (amount, decimals = 18) => {
  const divider = new BigNumber(10).pow(decimals)
  return new BigNumber(amount).div(divider).toFixed()
}

const unitToSubunit = (amount, decimals = 18) => {
  const multiplier = new BigNumber(10).pow(decimals)
  return new BigNumber(amount).times(multiplier).toFixed()
}

module.exports = { subunitToUnit, unitToSubunit }
