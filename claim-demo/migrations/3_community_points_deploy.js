const CommunityPoint = artifacts.require("RedditCommunityPoint");

module.exports = function (deployer) {
    deployer.deploy(CommunityPoint);
};
