const express = require('express');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const morgan = require('morgan');
const config = require('./config/APP_CONFIG');
const db_connection = require('./model/db');
const authenticate = require('./authentication/authenticate')

//importing models
const userDB = require('./model/users')
const bankDB = require('./model/banks')
const supplierDB = require('./model/supplier')
const projectDB = require('./model/projects')
const lcDB = require('./model/lc')


// Importing Routes
const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api/index');
const app = express();

/**
 * Setting up view engine. Will not use this as
 * this is an API Server
 */

// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// Setting up loggers
app.use(morgan('dev'))

// bodyParser.json() is equivalent to express.json()
// it was added back to express in version 4.16.0
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));

app.use(session({
  secret: config.$APP_SECRET,
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({
    mongooseConnection: db_connection
  }),
  loginAttempts: 0,
  blocked: false,
  authenticated: false,
}));

app.use(express.static(path.join(__dirname, 'client/src')));

app.use('/session-authenticate', authenticate)
app.use('/', indexRouter);
app.use('/api',apiRouter);

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;