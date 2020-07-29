const Distribution = artifacts.require('Distribution');
const SubredditPoint = artifacts.require('SubredditPoint');
const Subscription = artifacts.require('Subscription');
const Karma = artifacts.require('Karma');


module.exports = async (_deployer) => {
  const distribution = await Distribution.deployed();
  const subredditPoint = await SubredditPoint.deployed();
  const subscription = await Subscription.deployed();
  const karma = await Karma.deployed();

  console.log({
    distribution: distribution.address,
    subredditPoint: subredditPoint.address,
    subscription: subscription.address,
    karma: karma.address,
  });
};
