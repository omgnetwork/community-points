const Migrations = artifacts.require("Migrations");

module.exports = async (deployer, _, [_deployerAddress, _subredditOwner]) => {
  await deployer.deploy(Migrations);
};
