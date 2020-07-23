
let feeInfo = null

module.exports = {
  getFeeInfo: async function (childChain, currency) {
    if (!feeInfo) {
      const fees = (await childChain.getFees())['1']
      feeInfo = fees.find(fee => fee.currency.toLowerCase() === currency.toLowerCase())
      if (!feeInfo) {
        throw new Error(`Configured FEE_TOKEN ${currency} is not a supported fee token`)
      }
    }
    return feeInfo
  }
}
