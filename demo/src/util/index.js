const BigNumber = require('bignumber.js')
const BN = require('bn.js')

const subunitToUnit = (amount, decimals = 18) => {
  const divider = new BigNumber(10).pow(decimals)
  return new BigNumber(amount).div(divider).toFixed()
}

const unitToSubunit = (amount, decimals = 18) => {
  const multiplier = new BigNumber(10).pow(decimals)
  return new BigNumber(amount).times(multiplier).toFixed()
}

const unitToBN = (amount, decimals = 18) => {
  const subunit = unitToSubunit(amount, decimals)
  return new BN(subunit)
}

module.exports = { subunitToUnit, unitToBN, unitToSubunit }
