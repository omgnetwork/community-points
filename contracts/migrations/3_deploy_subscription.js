const Subscription = artifacts.require('Subscription');

module.exports = async (deployer, _, [_deployerAddress, _subredditOwner]) => {
  await deployer.deploy(
    Subscription,
    "2020 August Rock subscription",
    "AUGROCK",
  );
};
