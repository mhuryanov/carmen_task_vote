// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "./itoken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ArticleContract is Ownable {
    uint256 public articlesCounter = 0;
    address private tokenAddress;
    mapping(uint256 => Article) public articles;

    enum VoteState {
        None,
        Yes,
        No
    }

    // Structs
    struct Article {
        uint256 id;
        string title;
        string description;
        uint256 createdAt;
        uint256 votesYes;
        uint256 votesNo;
        uint256 price;
        uint256 expires;
        mapping(address => VoteState) addressesWithVote;
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
            articles[articleID].addressesWithVote[msg.sender] == VoteState.None,
            "Article was already voted by you!"
        );
        _;
    }

    modifier hasVoted(uint256 articleID) {
        require(
            articles[articleID].addressesWithVote[msg.sender] != VoteState.None,
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
        uint256 votesYes,
        uint256 votesNo,
        uint256 price,
        uint256 expires
    );

    event ArticleUpdated(
        uint256 id,
        string title,
        string description,
        uint256 createdAt,
        uint256 votesYes,
        uint256 votesNo,
        uint256 price,
        uint256 expires
    );

    // End of events

    constructor(address _tokenAddress) {
        _transferOwnership(msg.sender);
        tokenAddress = _tokenAddress;
        createArticle("My first article", "Hello world", 5, block.timestamp);
    }

    function createArticle(
        string memory _title,
        string memory _description,
        uint256 _price,
        uint256 _expires
    ) public {
        articlesCounter++;

        Article storage _newArticle = articles[articlesCounter];

        _newArticle.id = articlesCounter;
        _newArticle.title = _title;
        _newArticle.description = _description;
        _newArticle.createdAt = block.timestamp;
        _newArticle.votesYes = 0;
        _newArticle.votesNo = 0;
        _newArticle.price = _price;
        _newArticle.expires = _expires;

        emit ArticleCreated(
            articlesCounter,
            _title,
            _description,
            block.timestamp,
            0,
            0,
            _price,
            _expires
        );
    }

    function addVoteToArticle(uint256 articleID, VoteState state)
        public
        articleExists(articleID)
        hasNotVoted(articleID)
    {
        Article storage _articleToUpdate = articles[articleID];
        if (state == VoteState.Yes)
            _articleToUpdate.votesYes = _articleToUpdate.votesYes + 1;
        else if (state == VoteState.No)
            _articleToUpdate.votesNo = _articleToUpdate.votesNo + 1;

        _articleToUpdate.addressesWithVote[msg.sender] = state;

        emit ArticleUpdated(
            _articleToUpdate.id,
            _articleToUpdate.title,
            _articleToUpdate.description,
            _articleToUpdate.createdAt,
            _articleToUpdate.votesYes,
            _articleToUpdate.votesNo,
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
        VoteState state = _articleToUpdate.addressesWithVote[msg.sender];
        if (state == VoteState.Yes)
            _articleToUpdate.votesYes = _articleToUpdate.votesYes - 1;
        else if (state == VoteState.No)
            _articleToUpdate.votesNo = _articleToUpdate.votesNo - 1;
        _articleToUpdate.addressesWithVote[msg.sender] = VoteState.None;

        emit ArticleUpdated(
            _articleToUpdate.id,
            _articleToUpdate.title,
            _articleToUpdate.description,
            _articleToUpdate.createdAt,
            _articleToUpdate.votesYes,
            _articleToUpdate.votesNo,
            _articleToUpdate.price,
            _articleToUpdate.expires
        );
    }

    function endArticle(uint256 articleID)
        public
        onlyOwner
        articleExists(articleID)
    {
        Article storage article = articles[articleID];
        if (article.votesYes > article.votesNo) {
            Token(tokenAddress).distribute(article.price);
        } else {
            delete article.id;
        }
    }

    function votedStateBySender(uint256 articleID)
        public
        view
        articleExists(articleID)
        returns (VoteState)
    {
        return articles[articleID].addressesWithVote[msg.sender];
    }
}
