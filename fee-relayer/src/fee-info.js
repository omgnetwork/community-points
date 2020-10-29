module.exports = {
  getFeeInfo: async function (childChain, currency) {
    const fees = (await childChain.getFees())['1']
    const feeInfo = fees.find(fee => fee.currency.toLowerCase() === currency.toLowerCase())
    if (!feeInfo) {
      throw new Error(`Configured FEE_TOKEN ${currency} is not a supported fee token`)
    }
    return feeInfo
  }
}
