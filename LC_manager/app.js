var createError = require('http-errors');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');


// entities
sbank = require('./model/banks')
nbank = require('./model/nativeBanks')
supplier = require('./model/supplier')
project = require('./model/projects')
LC = require('./model/lc')


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var nativeBanksRouter = require('./routes/nativeBanks');
var suppliersRouter = require('./routes/suppliers');
var projectsRouter = require('./routes/projects');
var LCsRouter = require('./routes/lc');

// database connections
var db = require('./model/db');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/nativeBanks',nativeBanksRouter);
app.use('/suppliers', suppliersRouter);
app.use('/projects', projectsRouter);
app.use('/LCs', LCsRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
