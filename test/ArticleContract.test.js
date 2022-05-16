// Load dependencies
const { expect } = require('chai');
const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

// Load compiled artifacts
const ArticleContract = artifacts.require('ArticleContract');
const Token = artifacts.require("Token");

// Start test block
contract('ArticleContract', function([owner, other]) {
    beforeEach(async function() {
        this.articleFactory = await ArticleContract.new({ from: owner });
    });

    it('should be deployed with one article on it', async function() {
        const numberOfArticles = await this.articleFactory.articlesCounter.call({ from: owner });
        expect(numberOfArticles.toString()).to.equal("1");

        const articleContent = await this.articleFactory.articles.call(0, { from: owner });

        expect(articleContent.title).to.equal("mi primera tarea");
        expect(articleContent.description).to.equal("descripcion de la primera tarea");
    });

    it('should be able to add a new article', async function() {

        await this.articleFactory.createArticle("test title", "test description");

        const numberOfArticles = await this.articleFactory.articlesCounter.call({ from: owner });
        expect(numberOfArticles.toString()).to.equal("2");

        const articleContent = await this.articleFactory.articles.call(1, { from: owner });

        expect(articleContent.title).to.equal("test title");
        expect(articleContent.description).to.equal("test description");
    });

    it('should be able to add a vote to an article not voted by the user', async function() {

        await this.articleFactory.addVoteToArticle(0, { from: owner });

        const articleContent = await this.articleFactory.articles.call(0, { from: owner });

        expect(articleContent.votes.toString()).to.equal("1");
    });

    it('should not be able to add a vote to an article already voted by the user', async function() {

        await this.articleFactory.addVoteToArticle(0, { from: owner });

        await expectRevert(this.articleFactory.addVoteToArticle(0, { from: owner }), 'Article was already voted by you!');
    });

    it('should not be able to add a vote to an article that does not exist', async function() {
        await expectRevert(this.articleFactory.addVoteToArticle(999, { from: owner }), 'Article with the requested ID does not exist!');
    });

    it('should be able to add a vote to an article voted by another user', async function() {

        await this.articleFactory.addVoteToArticle(0, { from: owner });
        await this.articleFactory.addVoteToArticle(0, { from: other });

        const articleContent = await this.articleFactory.articles.call(0, { from: owner });

        expect(articleContent.votes.toString()).to.equal("2");
    });

    it('should not be able to remove a vote to an article that does not exist', async function() {
        await expectRevert(this.articleFactory.removeVoteToArticle(999, { from: owner }), 'Article with the requested ID does not exist!');
    });

    it('should not be able to remove a vote to an article not voted by the user', async function() {
        await expectRevert(this.articleFactory.removeVoteToArticle(0, { from: owner }), 'Article was not voted by you!');
    });

    it('should be able to remove a vote to an article voted by the user', async function() {

        await this.articleFactory.addVoteToArticle(0, { from: owner });
        let articleContent = await this.articleFactory.articles.call(0, { from: owner });
        expect(articleContent.votes.toString()).to.equal("1");

        await this.articleFactory.removeVoteToArticle(0, { from: owner });
        articleContent = await this.articleFactory.articles.call(0, { from: owner });
        expect(articleContent.votes.toString()).to.equal("0");
    });

    it('should confirm a user has voted if they did', async function() {

        await this.articleFactory.addVoteToArticle(0, { from: owner });
        let articleContent = await this.articleFactory.articles.call(0, { from: owner });
        expect(articleContent.votes.toString()).to.equal("1");

        expect(await this.articleFactory.isVotedBySender(0, { from: owner })).to.equal(true);
    });

    it('should confirm a user has not voted if they did not', async function() {

        let articleContent = await this.articleFactory.articles.call(0, { from: owner });
        expect(articleContent.votes.toString()).to.equal("0");

        expect(await this.articleFactory.isVotedBySender(0, { from: owner })).to.equal(false);
    });

    it('should confirm a user has not voted if they did not but other did', async function() {
        await this.articleFactory.addVoteToArticle(0, { from: other });
        let articleContent = await this.articleFactory.articles.call(0, { from: owner });
        expect(articleContent.votes.toString()).to.equal("1");

        expect(await this.articleFactory.isVotedBySender(0, { from: owner })).to.equal(false);
    });

    it('should fail to get the vote data if the article does not exist', async function() {
        await expectRevert(this.articleFactory.isVotedBySender(999, { from: owner }), 'Article with the requested ID does not exist!');
    });
});