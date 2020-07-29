const SubredditPoint = artifacts.require('SubredditPoint');

module.exports = async (deployer) => {
  await deployer.deploy(SubredditPoint);
};
