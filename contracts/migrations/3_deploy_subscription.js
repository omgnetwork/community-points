const Subscription = artifacts.require('Subscription');

module.exports = async (deployer) => {
  await deployer.deploy(
    Subscription,
    "2020 August Rock subscription",
    "AUGROCK",
  );

  const subscriptionContract = await Subscription.deployed();
  const subredditOwner = process.env.SUBREDDIT_OWNER;
  await subscriptionContract.transferOwnership(subredditOwner);
};
