const mongoose = require('mongoose')
var url = 'mongodb://abhishek0798:w2gwJC5@localhost:27017/mvomni'
var options = {}
mongoose.connect(url, options).then(
    () => { console.log('MongoDB connection Established. ') },
    err => {  console.log('Connection could not be established.');
	      throw err;
	   }
);

var db = mongoose.connection;
module.exports = db

