document.addEventListener("DOMContentLoaded", () => {
    App.init();
});


const articleForm = document.querySelector("#articleForm");

articleForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = articleForm["title"].value;
    const description = articleForm["description"].value;
    const price = articleForm["price"].value;
    const expires = Date.parse(articleForm["timeEndsAt"].value) / 1000;
    App.createArticle(title, description, price, expires);
});
