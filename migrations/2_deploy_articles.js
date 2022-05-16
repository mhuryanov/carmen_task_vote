const ArticleContract = artifacts.require("ArticleContract.sol");

module.exports = function(deployer) {
    deployer.deploy(ArticleContract);
};