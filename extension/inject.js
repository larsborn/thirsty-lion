const firebase = require('firebase');

function init() {
  const database = firebase.initializeApp(require('./creds.json')).database();
  const target = document.getElementsByTagName('head');
  if (!target || !target[0]) {
    return;
  }

  const observer = new MutationObserver(function (mutations) {
    for (let i = 0; i < mutations.length; i++) {
      for (let j = 0; j < mutations[0].addedNodes.length; j++) {
        let addedTag = mutations[0].addedNodes[j];
        if (addedTag.tagName.toLowerCase() === 'script') {
          database.ref('tasks').push({
            url: addedTag.src,
            sentAt: (new Date()).toISOString()
          });
        }
      }
    }
  });
  observer.observe(target[0], {childList: true});
}

init();
