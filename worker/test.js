const firebase = require('firebase');
const config = require('./config.json');

const connection = firebase.initializeApp(config.firebase);


connection.database().ref('tasks').push('foo');