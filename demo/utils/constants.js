require('dotenv').config()

const { CONTRACT_ADDRESS_KRP, CONTRACT_ADDRESS_RCP } = process.env

const currency = {
  ETH: '0x0000000000000000000000000000000000000000',
  KRP: CONTRACT_ADDRESS_KRP,
  RCP: CONTRACT_ADDRESS_RCP
}

module.exports = { currency }
