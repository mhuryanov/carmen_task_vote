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
            console.log(
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

        for (let i = 0; i < articleCounterNumber; i++) {
            const article = await App.ArticleContract.articles(i);
            const articleId = article[0].toNumber();

            App.articles.push({
                votes: article[4].toNumber(),
                id: articleId,
                title: article[1],
                description: article[2],
                createdAt: article[3],
                price: article[5],
                isVotedByUser: (await App.ArticleContract.isVotedBySender(articleId, { from: App.account })) || false
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
        return `
        <div class="card bg-secundary rounded-0 mb-2">
            <div class="card-header d-flex bg-dark text-white justify-content-between align-items-center">
                <span>${itemData.title}</span>
            </div>
            <div class="card-body">
                <span>${itemData.description}</span>
        
                <p class="text-muted">Tarea fue creada el ${new Date(itemData.createdAt * 1000).toLocaleString()}</p>
                
                <div class="itemVotesContainer">
                    <span class="text-muted">Precio: ${itemData.price.toLocaleString()}</span>
                    <span class="text-muted">Votos: ${itemData.votes.toLocaleString()}</span>
                    <div class="btn ${itemData.isVotedByUser ? 'removeVote' : ''}" onclick="App.voteArticle(${itemData.id}, ${!itemData.isVotedByUser})">
                        ${itemData.isVotedByUser ? "Remover Voto" : "Votar"}
                    </div>
                </div>
            </div>
        </div>`;
    },
    renderArticlesList: () => {
        const _itemsToRender = App.articles.sort((itemA, itemB) => App.sortedByVotes ? itemB.votes - itemA.votes : itemA.id - itemB.id).map(item => App.renderArticle(item));

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
    voteArticle: async (articleID, addVote = true) => {
        try {
            let _result;

            if (addVote) {
                _result = await App.ArticleContract.addVoteToArticle(articleID, { from: App.account });
            } else {
                _result = await App.ArticleContract.removeVoteToArticle(articleID, { from: App.account });
            }
            //window.location.reload();
            App.loadAndRenderArticles();
        } catch (error) {
            console.error(error);
        }
    },
};