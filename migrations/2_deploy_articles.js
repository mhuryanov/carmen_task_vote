const ArticleContract = artifacts.require("ArticleContract.sol");
const Token = artifacts.require("Token");

module.exports = function(deployer) {
    deployer.deploy(Token).then(function(){
        return deployer.deploy(ArticleContract, Token.address)});
};