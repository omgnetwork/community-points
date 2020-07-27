require("dotenv").config()

const { getAccount, getProvider, getContract } = require("./helpers")
const { abi: KarmaPointContractABI } = require("../build/contracts/KarmaPoint.json")

const { DISTRIBUTION_ADDRESS_PRIVATE_KEY, WEB3_PROVIDER, KARMA_POINTS_CONTRACT_ADDRESS } = process.env

const Provider = getProvider(WEB3_PROVIDER)
const Distributor = getAccount(Provider, DISTRIBUTION_ADDRESS_PRIVATE_KEY)
const KarmaPointsContract = getContract(Provider, KarmaPointContractABI, KARMA_POINTS_CONTRACT_ADDRESS)

module.exports = { Distributor, Provider, KarmaPointsContract }