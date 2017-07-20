const crypto = require('crypto');
const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);


const firebase = require('firebase');
const config = require('./config.json');
const axios = require('axios');


const connection = firebase.initializeApp(config.firebase);

console.log('start');


setInterval(() => once(run), 1000);

async function run() {
  console.log('has new data?');

  const task = await getNextTask();

  if (!task) {
    return;
  }

  const file = await downloadFile(task.url);
  const result = await yara(file);
  await writeResult(task, result);
}

async function yara(file) {
  //const {stdout} = await exec('/home/larsborn/yara-3.4.0/yara /home/larsborn/yrules/main.yara ' + file);

  const stdout = `
angler /var/www/virtual/larsborn/backend/inject.js
xml_http_request /var/www/virtual/larsborn/backend/inject.js
  `;

  return stdout.split('\n').map(function (line) {
    const i = line.indexOf(' ');
    if (i === -1) return null;
    return line.substr(0, i);
  }).filter(function (elem) {
    return elem
  });
}

async function getNextTask() {
  const snapshot = await connection.database().ref('tasks').orderByKey().limitToFirst(1).once('value');
  const data = snapshot.val();

  if (!data) {
    return null;
  }

  const [task] = normalizeList(data);
  await connection.database().ref('tasks/' + task.id).remove();

  return task;
}

async function writeResult(task, result) {
  await connection.database().ref('results/' + task.id).set(result);
}

async function downloadFile(url) {
  const response = await axios.get(url);
  const data = response.data;

  const hash = crypto.createHash('sha256').update(data, 'utf8').digest('hex');
  const path = "/tmp/" + hash;

  fs.writeFileSync(path, data);

  return path;
}

function sha256() {
  return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
}

function normalizeList(list) {
  return Object.keys(list).map((key) => {
    const element = list[key];

    return Object.assign({
      id: key
    }, element);

  });
}

async function once(callback) {
  if (this.running) {
    return;
  }

  this.running = true;

  try {
    await callback();
  } catch (e) {
    console.log(e);
  }
  this.running = false;
}

once.running = false;