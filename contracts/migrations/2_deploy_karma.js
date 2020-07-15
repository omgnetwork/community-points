const Karma = artifacts.require('Karma');

module.exports = async (deployer, _, [_deployerAddress, _subredditOwner]) => {
  await deployer.deploy(Karma);
};
