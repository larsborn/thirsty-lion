const firebase = require('firebase');
const tldExtract = require('tld-extract');

const database = firebase.initializeApp(require('./creds.json')).database();
const domain = tldExtract(location.href).domain;

function routeTag(tag) {
  switch (tag.tagName.toLowerCase()) {
    case 'script':
      return processScriptTag(tag);
  }
}

function processScriptTag(scriptTag) {
  const thisDomain = tldExtract(scriptTag.src).domain;
  if (thisDomain === domain) return;
  listenToResult(writeTask(scriptTag.src));
}

function writeTask(url) {
  return database.ref('tasks').push({
    url: url,
    sentAt: (new Date()).toISOString()
  }).key;
}

function listenToResult(key) {
  database.ref('results/' + key).on('value', (snapshot) => {
    let val = snapshot.val();
    if (val) displayMessage(val.join(', '));
  });
}

function displayMessage(msg) {
  const div = document.createElement("div");
  div.className = 'thirsty-lion';
  div.innerHTML = 'YARA-Matches: ' + msg;
  document.getElementsByTagName('body')[0].appendChild(div);
}

function init() {
  const target = document.getElementsByTagName('head');
  if (!target || !target[0]) return;

  const observer = new MutationObserver(function (mutations) {
    for (let i = 0; i < mutations.length; i++) {
      for (let j = 0; j < mutations[0].addedNodes.length; j++) {
        routeTag(mutations[0].addedNodes[j]);
      }
    }
  });
  observer.observe(target[0], {childList: true});
}

init();
