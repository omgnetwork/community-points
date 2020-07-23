const Distribution = artifacts.require('Distribution');
const SubredditPoint = artifacts.require('SubredditPoint');

const SUPPLY_DECAY_PERCENTAGE = 10;
const INITIAL_DISTRIBUTION = 1000000;
const TOTAL_KARMA_ON_INITIAL_ROUND = 100000;

module.exports = async (deployer) => {
  const subredditPoint = await SubredditPoint.deployed();
  const subredditOwner = process.env.SUBREDDIT_OWNER;
  await deployer.deploy(
    Distribution,
    subredditPoint.address,
    SUPPLY_DECAY_PERCENTAGE,
    subredditOwner
  );
  const distribution = await Distribution.deployed();
  // transfer the ownership to distribution contract to allow the contract to mint points
  await subredditPoint.transferOwnership(distribution.address);

  await distribution.initRound(INITIAL_DISTRIBUTION, TOTAL_KARMA_ON_INITIAL_ROUND);
};
