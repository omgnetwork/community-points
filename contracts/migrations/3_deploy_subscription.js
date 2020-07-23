const Subscription = artifacts.require('Subscription');

module.exports = async (deployer) => {
  await deployer.deploy(
    Subscription,
    "2020 August Rock subscription",
    "AUGROCK",
  );
};
