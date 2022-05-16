const VOTESTATE_NONE = 0;
const VOTESTATE_YES = 1;
const VOTESTATE_NO = 2;
App = {
    contracts: {},
    articles: [],
    sortedByVotes: false,
    init: async () => {
        await App.loadWeb3();
        await App.loadAccount();
        await App.loadContract();
        await App.render();
        await App.loadAndRenderArticles();
    },
    loadWeb3: async () => {
        if (window.ethereum) {
            App.web3Provider = window.ethereum;
            await window.ethereum.request({ method: "eth_requestAccounts" });
        } else if (web3) {
            web3 = new Web3(window.web3.currentProvider);
        } else {
            window.alert(
                "No ethereum browser is installed. Try it installing MetaMask "
            );
        }
    },
    loadAccount: async () => {
        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
        });
        App.account = accounts[0];
    },
    loadContract: async () => {
        try {
            const res = await fetch("ArticleContract.json");
            const ArticleContractJSON = await res.json();
            App.contracts.ArticleContract = TruffleContract(ArticleContractJSON);
            App.contracts.ArticleContract.setProvider(App.web3Provider);

            App.ArticleContract = await App.contracts.ArticleContract.deployed();
        } catch (error) {
            console.error(error);
        }
    },
    render: async () => {
        document.getElementById("account").innerText = App.account;
    },
    loadAndRenderArticles: async () => {
        const articlesCounter = await App.ArticleContract.articlesCounter();
        const articleCounterNumber = articlesCounter.toNumber();

        App.articles = [];

        for (let i = 1; i <= articleCounterNumber; i++) {
            const article = await App.ArticleContract.articles(i);
            const articleId = article[0].toNumber();
            if (articleId == 0)
                continue;
            const votedState = await App.ArticleContract.votedStateBySender(articleId, { from: App.account })
            App.articles.push({
                id: articleId,
                title: article[1],
                description: article[2],
                createdAt: article[3],
                votesYes: article[4].toNumber(),
                votesNo: article[5].toNumber(),
                price: article[6].toNumber(),
                expires: article[7],
                votedStateByUser: votedState.toNumber()
            })
        }

        App.renderArticlesList();
    },
    sortList: () => {
        if (App.sortedByVotes) {
            document.querySelector("#sortButton").innerHTML = "Ordenar por votos";
            App.sortedByVotes = false;
        } else {
            document.querySelector("#sortButton").innerHTML = "Desordenar";
            App.sortedByVotes = true;
        }

        App.renderArticlesList();
    },
    renderArticle: (itemData) => {
        new Date() < new Date(itemData.expires * 1000) ? end_disabled = true : end_disabled = false;
        return `
        <div class="card bg-secundary rounded-0 mb-2">
            <div class="card-header d-flex bg-dark text-white justify-content-between align-items-center">
                <span>${itemData.title}</span>
                <button  ${end_disabled ? "disabled" : ""} class="btn btn-outline-light" style="float:right;" onclick="App.endArticle(${itemData.id})">End</button>
            </div>
            <div class="card-body">
                <span>${itemData.description}</span>
        
                <p class="text-muted">Tarea fue creada el ${new Date(itemData.createdAt * 1000).toLocaleString()}</p>
                <p class="text-muted">Task ends at ${new Date(itemData.expires * 1000).toLocaleString()}</p>

                
                <div class="itemVotesContainer" style="display: block;">
                    <span class="text-muted" style="margin-right:10px;">Precio: ${itemData.price.toLocaleString()}</span>
                    <span class="text-muted">Votos(YES): ${itemData.votesYes.toLocaleString()}</span>
                    <span class="text-muted">Votos(NO): ${itemData.votesNo.toLocaleString()}</span>
                    <div class="btn ${itemData.votedStateByUser == 1 ? "disabled" : ""} ${itemData.votedStateByUser ? 'removeVote' : ''}" onclick="App.voteArticle(${itemData.id}, ${itemData.votedStateByUser ? VOTESTATE_NONE : VOTESTATE_NO})" style="float:right;">
                        ${itemData.votedStateByUser != 2 ? "No" : "Remover Voto"}
                    </div>
                    <div class="btn ${itemData.votedStateByUser == 2 ? "disabled" : ""} ${itemData.votedStateByUser ? 'removeVote' : ''}" onclick="App.voteArticle(${itemData.id}, ${itemData.votedStateByUser ? VOTESTATE_NONE : VOTESTATE_YES})" style="float:right;margin-right:10px;">
                        ${itemData.votedStateByUser != 1 ? "Yes" : "Remover Voto"}
                    </div>
                </div>
            </div>
        </div>`;
    },
    renderArticlesList: () => {
        const _itemsToRender = App.articles.sort((itemA, itemB) => App.sortedByVotes ? itemB.votesYes - itemB.votesNo - (itemA.votesYes - itemA.votesNo) : itemA.id - itemB.id).map(item => App.renderArticle(item));

        document.querySelector("#articlesList").innerHTML = _itemsToRender.join('\n');
    },
    clearArticlesList: () => {
        document.querySelector("#articlesList").innerHTML = "";
    },
    createArticle: async (title, description, price, expires) => {
        try {
            const result = await App.ArticleContract.createArticle(title, description, price, expires, {
                from: App.account,
            });
            console.log(result.logs[0].args);
            //window.location.reload();
            App.loadAndRenderArticles();
        } catch (error) {
            console.error(error);
        }
    },
    voteArticle: async (articleID, voteState) => {
        try {
            let _result;

            if (voteState) {
                _result = await App.ArticleContract.addVoteToArticle(articleID, voteState, { from: App.account });
            } else {
                _result = await App.ArticleContract.removeVoteToArticle(articleID, { from: App.account });
            }
            //window.location.reload();
            App.loadAndRenderArticles();
        } catch (error) {
            console.error(error);
        }
    },
    endArticle: async (articleID) => {
        try {

            await App.ArticleContract.endArticle(articleID, { from: App.account });
            App.loadAndRenderArticles();
        } catch (error) {
            console.error(error);
        }
    }
};