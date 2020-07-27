const { Distributor, KarmaPointsContract, Provider } = require("./utils/config")
const { getPointBalance, mint } = require("./utils/helpers")

const executeClaimFlow = async () => {
    console.log(`Karma Points contract address is ${KarmaPointsContract._address}`)

    let balance = await getPointBalance(KarmaPointsContract, Distributor.address)
    console.log(`Distributor KRT balance on Ethereum Network is now ${balance}`)

    console.log("Distributor will mint 100 KRT ...")

    const receipt = await mint(Provider, KarmaPointsContract, Distributor, Distributor, 100)
    console.log(`Minting transaction: ${receipt.transactionHash}`)

    balance = await getPointBalance(KarmaPointsContract, Distributor.address)
    console.log(`Distributor KRT balance on Ethereum Network is now ${balance}`)
}
