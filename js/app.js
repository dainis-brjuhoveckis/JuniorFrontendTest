function app() {
    "use strict";
    const URL_PREFIX = "https://api.github.com/users";

    let AppUtilities = function() { return undefined; };

    AppUtilities.prototype.setElemText = function (elem, text) {
        if (elem.firstChild === null) {
            elem.appendChild(document.createTextNode(""));
        }
        elem.firstChild.nodeValue = text;
        return elem;
    };

    AppUtilities.prototype.setSelectorElemText = function (selector, text) {
        let elem = document.querySelector(selector);
        return AppUtilities.prototype.setElemText(elem, text);
    };

    AppUtilities.prototype.retrieveData = function(url, callbackFunction, errorFunction) {
        let request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (request.readyState === 4) {
                switch (request.status) {
                case 200:
                    callbackFunction(JSON.parse(request.responseText));
                    break;
                case 404:
                    errorFunction("Does not exist");
                    break;
                default:
                    errorFunction("Something went wrong: " + request.status + 
                        " " + request.statusText);
                }
            }
        };
        request.open("GET", url, true);
        request.send();
    };

    AppUtilities.prototype.joinArray = function (array, separator) {
        return array.join(separator);
    };

    let utilities = new AppUtilities();


    function hideSearchResult() {
        document.querySelector("#search-result").style.display = "none";
    }

    function showError(msg) {
        hideSearchResult();
        let elem = utilities.setSelectorElemText(".error", msg);
        elem.style.display = "block";
    }

    function hideError() {
        document.querySelector(".error").style.display = "none";
    }

    function showSearchResult() {
        hideError();        
        document.querySelector("#search-result").style.display = "block";
    }

    function renderUserInfo(responseObj) {
        document.querySelector("#search-result #avatar").src = 
                                                        responseObj.avatar_url;
        utilities.setSelectorElemText("#search-result #username", "@" + responseObj.login);
        utilities.setSelectorElemText("#search-result #full-name", responseObj.name);
        utilities.setSelectorElemText("#search-result #bio", responseObj.bio);
    }

    function renderUserRepos(responseObj) {        
        let ul = document.querySelector("#repositories ul");
        while (ul.firstChild !== null) {
            ul.removeChild(ul.firstChild);        
        }

        responseObj.forEach(function(element) {
            let li = document.createElement("li");
            let span = document.createElement("span");
            span.setAttribute("class", "repo-name");
            li.appendChild(span);
            span.appendChild(document.createTextNode(element.name));

            span = document.createElement("span");
            span.setAttribute("class", "repo-forks");
            li.appendChild(span);
            span.appendChild(document.createTextNode(element.forks_count));

            span = document.createElement("span");
            span.setAttribute("class", "repo-stars");
            li.appendChild(span);
            span.appendChild(document.createTextNode(element.stargazers_count));

            ul.appendChild(li);
        });        
    }

    function retrieveUserInfo(login, callbackFunction) {
        let url = utilities.joinArray([URL_PREFIX, login], "/");
        utilities.retrieveData(url, callbackFunction, showError);
    }

    function retrieveUserRepos(login, callbackFunction) {
        let url = utilities.joinArray([URL_PREFIX, login, "repos"], "/");
        utilities.retrieveData(url, callbackFunction, showError);
    }

    function executeSearch(login) {     
        hideError();
        retrieveUserInfo(login, function(userData) {
            renderUserInfo(userData);
            retrieveUserRepos(userData.login, function(userReposData) {
                renderUserRepos(userReposData);
                showSearchResult();
            });
        });
    }

    function addSearchFormSubmitListener() {
        let form = document.querySelector("#search-form");
        form.addEventListener("submit", function(e) {
            e.preventDefault();
            executeSearch(document.querySelector("#search-username").value);
        });        
    }

    /*
    Separate handling for style: default text is bold and gray, but if something
    is entered, it remains thin and black even if user leaves the search box.
    */
    function addSearchFormUsernameListeners() {
        let username = document.querySelector("#search-username");
        ["keyup", "blur"].forEach(function(element) {
            username.addEventListener(element, function() {                
                if (username.value === "" || username.placeholder === username.value) {
                    username.style.color = "#AAAAAA";
                    username.style.fontWeight = "bold";
                } else {
                    username.style.color = "black";
                    username.style.fontWeight = "normal";
                }
            });
        });
    }

    function init() {
        addSearchFormSubmitListener();
        addSearchFormUsernameListeners();
    }

    init();
}

document.addEventListener("DOMContentLoaded", function () {
    "use strict";
    app();
});
