const Karma = artifacts.require('Karma');

module.exports = async (deployer) => {
  await deployer.deploy(Karma);
};
