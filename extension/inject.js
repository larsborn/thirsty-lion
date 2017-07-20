const firebase = require('firebase');
const tldExtract = require('tld-extract');

function init() {
  const database = firebase.initializeApp(require('./creds.json')).database();

  const target = document.getElementsByTagName('head');
  if (!target || !target[0]) {
    return;
  }

  const observer = new MutationObserver(function (mutations) {
    const domain = tldExtract(location.href).domain;
    for (let i = 0; i < mutations.length; i++) {
      for (let j = 0; j < mutations[0].addedNodes.length; j++) {
        let addedTag = mutations[0].addedNodes[j];
        if (addedTag.tagName.toLowerCase() === 'script') {
          const thisDomain = tldExtract(addedTag.src).domain;
          if (thisDomain !== domain) {
            const ref = database.ref('tasks').push({
              url: addedTag.src,
              sentAt: (new Date()).toISOString()
            });
            database.ref('results/' + ref.key).on('value', (snapshot) => {
              let val = snapshot.val();
              if (!val) return;
              const div = document.createElement("div");
              div.className = 'thirsty-lion';
              div.innerHTML = 'YARA-Matches: ' + val.join(', ');
              document.getElementsByTagName('body')[0].appendChild(div);
            });
          }
        }
      }
    }
  });
  observer.observe(target[0], {childList: true});
}

init();
