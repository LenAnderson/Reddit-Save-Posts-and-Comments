// ==UserScript==
// @name         Reddit - Save Posts and Comments
// @namespace    https://github.com/LenAnderson/
// @downloadURL  https://github.com/LenAnderson/Reddit-Save-Posts-and-Comments/raw/master/reddit_save_posts_and_comments.user.js
// @version      1.0
// @author       LenAnderson
// @match        https://www.reddit.com/*
// @match        https://www.reddit.com
// @grant        GM_xmlhttpRequest
// ==/UserScript==
/* jshint -W097 */

(function() {
    'use strict';
    
    var conf;
    try {
        conf = JSON.parse(localStorage.getItem('reddit-save-in-gist'));
    } catch (ex) {}
    var gitUsername = conf? conf.user : '';
    var gitPassword = conf? conf.pass : '';
    var gistId = conf? conf.gist : '';

    function htmlDecode(input){
        var e = document.createElement('div');
        e.innerHTML = input;
        return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
    }
    
    
    function addSaveButtons() {
        [].forEach.call(document.querySelectorAll('.thing:not([data-type="morechildren"]) > .entry > .flat-list.buttons'), function(buttons) {
            if (buttons.hasAttribute('data-spac'))
                return;
            buttons.setAttribute('data-spac', '1');
            var li = document.createElement('li');
            var a = document.createElement('a');
            if (gitUsername && gitPassword && gistId) {
                a.href = 'javascript:;';
                a.textContent = 'save in gist';
                a.addEventListener('click', function() {
                    li.textContent = 'saving in gist...';
                    var thing = buttons.parentNode.parentNode;
                    var author = thing.getAttribute('data-author');
                    var link;
                    if (thing.getAttribute('data-type') == 'comment') {
                        link = buttons.querySelector('[data-event-action="permalink"]').href;
                    } else {
                        link = buttons.querySelector('[data-event-action="comments"]').href;
                    }
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', link+'.json', true);
                    xhr.addEventListener('load', function() {
                        var json = JSON.parse(xhr.responseText);
                        var body;
                        var title;
                        var id = json[1].data.children[0].data.id;
                        if (thing.getAttribute('data-type') == 'comment') {
                            body = htmlDecode(json[1].data.children[0].data.body);
                            title = '*'+json[1].data.children[0].data.author + '* on ' + json[0].data.children[0].data.title;
                        } else {
                            body = htmlDecode(json[0].data.children[0].data.selftext) || json[0].data.children[0].data.url;
                            title = json[0].data.children[0].data.title;
                        }
                        var files = {};
                        files[title + '(' + id + ')' + '.md'] = {
                            content: '##'+title+'\r\n'+link+'\r\n\r\n'+body
                        };
                        GM_xmlhttpRequest({
                            method: 'PATCH',
                            url: 'https://api.github.com/gists/' + gistId,
                            headers: {
                                'Authorization': 'Basic ' + btoa(gitUsername + ':' + gitPassword),
                                'Accept': 'application/vnd.github.v3+json',
                                'User-Agent': gitUsername
                            },
                            data: JSON.stringify({files:files}),
                            onload: function(resp) {
                                console.log(resp);
                                if (resp.statusText == 'OK') {
                                    li.textContent = 'saved in gist';
                                } else {
                                    li.textContent = 'something went wrong :(';
                                    li.title = 'Check the JavaScript console (press F12 to open developer tools) for more info.';
                                    li.style.cursor = 'help';
                                }
                            }
                        });
                    });
                    xhr.send();
                });
            } else {
                a.href = '/prefs/save-in-gist/';
                a.textContent = 'CONFIGURE: save in gist';
            }
            li.appendChild(a);
            buttons.appendChild(li);
        });
    }
    
    function showPrefs() {
        var pagename = document.querySelector('.pagename.selected');
        pagename.textContent = 'preferences';
        var tabmenu = document.createElement('ul');
        tabmenu.classList.add('tabmenu');
        pagename.parentNode.appendChild(tabmenu);
        addPrefsLink('options', '/prefs/');
        addPrefsLink('apps', '/prefs/apps/');
        addPrefsLink('RSS feeds', '/prefs/feeds/');
        addPrefsLink('friends', '/prefs/friends/');
        addPrefsLink('blocked', '/prefs/blocked/');
        addPrefsLink('password/email', '/prefs/update/');
        addPrefsLink('deactivate', '/prefs/deactivate/');
        addPrefsLink('save in gist', '/prefs/save-in-gist/', true);
        
        document.querySelector('#classy-error').remove();
        var content = document.querySelector('.content[role="main"]');
        var h1 = document.createElement('h1');
        h1.textContent = 'save in gist';
        content.appendChild(h1);
        var inpUser;
        var inpPass;
        var inpGist;
        (function() {
            var spacer = document.createElement('div');
            spacer.classList.add('spacer');
            {
                var roundfield = document.createElement('div');
                roundfield.classList.add('roundfield');
                {
                    var title = document.createElement('span');
                    title.classList.add('title');
                    title.textContent = 'github username';
                    roundfield.appendChild(title);
                    roundfield.appendChild(document.createTextNode(' '));
                    var descr = document.createElement('span');
                    descr.classList.add('little', 'gray', 'roundfield-description');
                    descr.textContent = '(required)';
                    roundfield.appendChild(descr);
                    var rcontent = document.createElement('div');
                    rcontent.classList.add('roundfield-content');
                    {
                        inpUser = document.createElement('input');
                        inpUser.type = 'text';
                        inpUser.value = gitUsername;
                        rcontent.appendChild(inpUser);
                    }
                    roundfield.appendChild(rcontent);
                }
                spacer.appendChild(roundfield);
            }
            content.appendChild(spacer);
        })();
        (function() {
            var spacer = document.createElement('div');
            spacer.classList.add('spacer');
            {
                var roundfield = document.createElement('div');
                roundfield.classList.add('roundfield');
                {
                    var title = document.createElement('span');
                    title.classList.add('title');
                    title.textContent = 'github password';
                    roundfield.appendChild(title);
                    roundfield.appendChild(document.createTextNode(' '));
                    var descr = document.createElement('span');
                    descr.classList.add('little', 'gray', 'roundfield-description');
                    descr.textContent = '(required)';
                    roundfield.appendChild(descr);
                    var rcontent = document.createElement('div');
                    rcontent.classList.add('roundfield-content');
                    {
                        inpPass = document.createElement('input');
                        inpPass.type = 'password';
                        inpPass.value = gitPassword;
                        rcontent.appendChild(inpPass);
                    }
                    roundfield.appendChild(rcontent);
                }
                spacer.appendChild(roundfield);
            }
            content.appendChild(spacer);
        })();
        (function() {
            var spacer = document.createElement('div');
            spacer.classList.add('spacer');
            {
                var roundfield = document.createElement('div');
                roundfield.classList.add('roundfield');
                {
                    var title = document.createElement('span');
                    title.classList.add('title');
                    title.textContent = 'gist id';
                    roundfield.appendChild(title);
                    roundfield.appendChild(document.createTextNode(' '));
                    var descr = document.createElement('span');
                    descr.classList.add('little', 'gray', 'roundfield-description');
                    descr.textContent = '(required)';
                    roundfield.appendChild(descr);
                    var rcontent = document.createElement('div');
                    rcontent.classList.add('roundfield-content');
                    {
                        inpGist = document.createElement('input');
                        inpGist.type = 'text';
                        inpGist.value = gistId;
                        rcontent.appendChild(inpGist);
                    }
                    roundfield.appendChild(rcontent);
                }
                spacer.appendChild(roundfield);
            }
            content.appendChild(spacer);
        })();
        var submit = document.createElement('button');
        submit.classList.add('btn');
        submit.textContent = 'save';
        submit.addEventListener('click', function() {
            localStorage.setItem('reddit-save-in-gist', JSON.stringify({
                user: inpUser.value,
                pass: inpPass.value,
                gist: inpGist.value
            }));
        });
        content.appendChild(submit);
    }
    
    function addPrefsLink(title, href, selected) {
        var ul = document.querySelector('.tabmenu');
        var li = document.createElement('li');
        if (selected) {
            li.classList.add('selected');
        }
        var a = document.createElement('a');
        a.classList.add('choice');
        a.href = href;
        a.textContent = title;
        li.appendChild(a);
        ul.appendChild(li);
    }
    
    
    if (location.href.search(/\/r\/[^\/]+\/comments\/.+/) != -1) {
        addSaveButtons();
        var mo = new MutationObserver(function(muts) {
            addSaveButtons();
        });
        mo.observe(document.body, {childList: true, subtree: true});
    } else if (location.href == 'https://www.reddit.com/prefs/save-in-gist/') {
        showPrefs();
    } else if (location.href.search(/^https:\/\/www\.reddit\.com\/prefs/) != -1) {
        addPrefsLink('save in gist', '/prefs/save-in-gist/');
    } else if (document.querySelector('.tabmenu > li > a[href*="/user/"][href*="/saved/"]')) {
        if (gitUsername && gitPassword && gistId) {
            addPrefsLink('saved in gist', 'https://gist.github.com/' + gitUsername + '/' + gistId);
        } else {
            addPrefsLink('CONFIGURE: save in gist', '/prefs/save-in-gist/');
        }
    }
})();
