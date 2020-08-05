const Karma = artifacts.require('Karma');

module.exports = async (deployer) => {
  await deployer.deploy(Karma);

  const karmaContract = await Karma.deployed();
  const subredditOwner = process.env.SUBREDDIT_OWNER;
  await karmaContract.transferOwnership(subredditOwner);
};
