// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "./itoken.sol";

contract ArticleContract {
    uint256 public articlesCounter = 0;
    mapping(uint256 => Article) public articles;

    // Structs
    struct Article {
        uint256 id;
        string title;
        string description;
        uint256 createdAt;
        uint256 votes;
        uint256 price;
        uint256 expires;
        mapping(address => bool) addressesWithVote;
    }
    // End of structs

    // Modifiers
    modifier articleExists(uint256 articleID) {
        require(
            articles[articleID].id == articleID,
            "Article with the requested ID does not exist!"
        );
        _;
    }

    modifier hasNotVoted(uint256 articleID) {
        require(
            articles[articleID].addressesWithVote[msg.sender] == false,
            "Article was already voted by you!"
        );
        _;
    }

    modifier hasVoted(uint256 articleID) {
        require(
            articles[articleID].addressesWithVote[msg.sender] == true,
            "Article was not voted by you!"
        );
        _;
    }
    // End of modifier

    // Events
    event ArticleCreated(
        uint256 id,
        string title,
        string description,
        uint256 createdAt,
        uint256 votes,
        uint256 price,
        uint256 expires
    );

    event ArticleUpdated(
        uint256 id,
        string title,
        string description,
        uint256 createdAt,
        uint256 votes,
        uint256 price,
        uint256 expires
    );

    // End of events

    constructor() {
        createArticle("My first article", "Hello world", 5, block.timestamp);
    }

    function createArticle(
        string memory _title,
        string memory _description,
        uint256 _price,
        uint256 _expires
    ) public {
        Article storage _newArticle = articles[articlesCounter];

        _newArticle.id = articlesCounter;
        _newArticle.title = _title;
        _newArticle.description = _description;
        _newArticle.createdAt = block.timestamp;
        _newArticle.votes = 0;
        _newArticle.price = _price;
        _newArticle.expires = _expires;

        articlesCounter++;

        emit ArticleCreated(
            articlesCounter,
            _title,
            _description,
            block.timestamp,
            0,
            _price,
            _expires
        );
    }

    function addVoteToArticle(uint256 articleID)
        public
        articleExists(articleID)
        hasNotVoted(articleID)
    {
        Article storage _articleToUpdate = articles[articleID];
        _articleToUpdate.votes = _articleToUpdate.votes + 1;
        _articleToUpdate.addressesWithVote[msg.sender] = true;

        emit ArticleUpdated(
            _articleToUpdate.id,
            _articleToUpdate.title,
            _articleToUpdate.description,
            _articleToUpdate.createdAt,
            _articleToUpdate.votes,
            _articleToUpdate.price,
            _articleToUpdate.expires
        );
    }

    function removeVoteToArticle(uint256 articleID)
        public
        articleExists(articleID)
        hasVoted(articleID)
    {
        Article storage _articleToUpdate = articles[articleID];
        _articleToUpdate.votes = _articleToUpdate.votes - 1;
        _articleToUpdate.addressesWithVote[msg.sender] = false;

        emit ArticleUpdated(
            _articleToUpdate.id,
            _articleToUpdate.title,
            _articleToUpdate.description,
            _articleToUpdate.createdAt,
            _articleToUpdate.votes,
            _articleToUpdate.price,
            _articleToUpdate.expires
        );
    }

    function isVotedBySender(uint256 articleID)
        public
        view
        articleExists(articleID)
        returns (bool)
    {
        return articles[articleID].addressesWithVote[msg.sender];
    }
}
