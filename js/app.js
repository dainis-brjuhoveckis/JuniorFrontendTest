'use strict';
  
function app() {
    const URL_PREFIX = 'https://api.github.com/users';
                
    let utilities = {
            log:  function(msg) {
                console.log(msg);
            },
            setElemText: function(elem, text) {
                if (elem.firstChild === null) {
                    elem.appendChild(document.createTextNode(""));
                }
                elem.firstChild.nodeValue = text;
                return elem;
            },
            setSelectorElemText: function (selector, text) {
                let elem = document.querySelector(selector);
                return utilities.setElemText(elem, text);
            },
            retrieveData: function (url, callbackFunction) {
                var request = new XMLHttpRequest();
                request.onreadystatechange = function() {
                    if (request.readyState === 4) {
                        switch(request.status) {
                            case 200:
                                callbackFunction(JSON.parse(this.responseText));
                                break;
                            case 404:
                                showError("Does not exist");
                                break;
                            default:
                                showError("Something went wrong: " + request.status + " " + 
                                            request.statusText);
                        }
                    }
                }
                request.open('GET', url, true)
                request.send();
            }
    }

    function showError(msg) {
        hideSearchResult();
        let elem = utilities.setSelectorElemText(".error", msg);
        elem.style.display = 'block';
    }

    function hideError() {
        document.querySelector(".error").style.display = 'none';
    }

    function showSearchResult() {
        hideError();        
        document.querySelector("#search-result").style.display = 'block';
    }

    function hideSearchResult() {
        document.querySelector("#search-result").style.display = 'none';
    }

    function renderUserData(responseObj) {
        document.querySelector("#search-result #avatar").src = 
                                                        responseObj.avatar_url;
        utilities.setSelectorElemText("#search-result #username", "@" + responseObj.login);
        utilities.setSelectorElemText("#search-result #full-name", responseObj.name);
        utilities.setSelectorElemText("#search-result #bio", responseObj.bio);
        
        retrieveUserRepos(responseObj.login);
    }

    function renderUserRepos(responseObj) {        
        let ul = document.querySelector("#repositories ul");
        while (ul.firstChild !== null) {
            ul.removeChild(ul.firstChild);        
        }

        responseObj.forEach(function(element, index, array) {
            let li = document.createElement('li');
            let span = document.createElement('span');
            span.setAttribute("class", "repo-name");
            li.appendChild(span);
            span.appendChild(document.createTextNode(element.name));

            span = document.createElement('span');
            span.setAttribute("class", "repo-forks");
            li.appendChild(span);
            span.appendChild(document.createTextNode(element.forks_count));

            span = document.createElement('span');
            span.setAttribute("class", "repo-stars");
            li.appendChild(span);
            span.appendChild(document.createTextNode(element.stargazers_count));

            ul.appendChild(li);
        });

        showSearchResult();
    }

    function retrieveUserInfo(login) {
        utilities.retrieveData([URL_PREFIX, login].join("/"), renderUserData);
    }

    function retrieveUserRepos(login) {
        utilities.retrieveData([URL_PREFIX, login, "repos"].join("/"), 
                    renderUserRepos);
    }

    function executeSearch(login) {
        hideSearchResult();        
        hideError();
        retrieveUserInfo(login);
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
        ["keyup", "blur"].forEach(function(element, index, array) {
            username.addEventListener(element, function(e) {
                if (this.value === "" || this.placeholder === this.value) {
                    this.style.color = "#AAAAAA";
                    this.style.fontWeight = "bold";
                } else {
                    this.style.color = "black";
                    this.style.fontWeight = "normal";
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

document.addEventListener("DOMContentLoaded", function(){
    app();
});
