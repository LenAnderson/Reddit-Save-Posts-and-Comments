// ==UserScript==
// @name         Reddit - Save Posts and Comments
// @namespace    https://github.com/LenAnderson/
// @downloadURL  https://github.com/LenAnderson/Reddit-Save-Posts-and-Comments/raw/master/reddit_save_posts_and_comments.user.js
// @version      0.1
// @author       LenAnderson
// @match        https://www.reddit.com/*
// @match        https://www.reddit.com
// @grant        none
// ==/UserScript==
/* jshint -W097 */

(function() {
    'use strict';
    
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
            a.href = 'javascript:;';
            a.textContent = 'save in inbox';
            a.addEventListener('click', function() {
                li.textContent = 'saving in inbox...';
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
                    if (thing.getAttribute('data-type') == 'comment') {
                        body = htmlDecode(json[1].data.children[0].data.body);
                        title = '/u/'+json[1].data.children[0].data.author + ' on ' + json[0].data.children[0].data.title;
                    } else {
                        body = htmlDecode(json[0].data.children[0].data.selftext) || json[0].data.children[0].data.url;
                        title = json[0].data.children[0].data.title;
                    }
                    var post = new XMLHttpRequest();
                    post.open('POST', '/api/compose', true);
                    post.setRequestHeader('content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
                    post.addEventListener('load', function() {
                        li.textContent = 'saved in inbox';
                    });
                    var params = [];
                    params.push({key:'to', val:document.querySelector('.user > a').textContent});
                    params.push({key:'subject', val:'[SPAC] '+title});
                    params.push({key:'text', val:body});
                    params.push({key:'uh', val:document.querySelector('[name="uh"]').value});
                    post.send(params.map(function(param) {
                        return encodeURIComponent(param.key) + '=' + encodeURIComponent(param.val);
                    }).join('&'));
                });
                xhr.send();
            });
            li.appendChild(a);
            buttons.appendChild(li);
        });
    }

    if (location.href.search(/\/r\/[^\/]+\/comments\/.+/) != -1) {
        addSaveButtons();
        var mo = new MutationObserver(function(muts) {
            addSaveButtons();
        });
        mo.observe(document.body, {childList: true, subtree: true});
    }
})();
