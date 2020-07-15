const SubredditPoint = artifacts.require('SubredditPoint');

module.exports = async (deployer, _, [_deployerAddress, _subredditOwner]) => {
  await deployer.deploy(SubredditPoint);
};
