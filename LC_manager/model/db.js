const mongoose = require('mongoose')
const app_config = require('../config/APP_CONFIG')
const id = app_config.database.id
const pass = app_config.database.pass
const db_name = app_config.database.name
const url = `mongodb://${id}:${pass}@localhost:27017/${db_name}`

var options = {}
mongoose.connect(url, options).then(
    () => {
        console.log('MongoDB connection Established. ')
    },
    err => {
        console.log('Connection could not be established.');
        throw err;
    }
);

var db = mongoose.connection;
module.exports = db