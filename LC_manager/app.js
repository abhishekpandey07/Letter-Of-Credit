var createError = require('http-errors');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
//var cookieParser = require('cookie-parser');
var session = require('express-session')
var MongoStore = require('connect-mongo')(session)
var morgan = require('morgan');
var winston = require('./config/winston')
var bodyParser = require('body-parser');
var cors = require('cors')


// entities
sbank = require('./model/banks')
nbank = require('./model/nativeBanks')
supplier = require('./model/supplier')
project = require('./model/projects')
LC = require('./model/lc')
users = require('./model/users')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var nativeBanksRouter = require('./routes/nativeBanks');
var suppliersRouter = require('./routes/suppliers');
var projectsRouter = require('./routes/projects');
var LCsRouter = require('./routes/lc');
var documents = require('./routes/documents')
var info = require('./routes/info')

// database connections
var db = require('./model/db');

var app = express();
app.set('trust proxy', 1)
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(morgan('combined',{stream: winston.stream}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(session({
	secret: 'work hard',
	resave: true,
	saveUninitialized: true,
	/*store: new MongoStore({
		mongoConnection: db
	}),*/
	cookie:{

	}
}))
/*app.use(cors({
	credentials: 'include'
}))*/
app.use(express.static(path.join(__dirname, 'client/src')));

/*app.use(function(req,res,next){

	next()
})*/


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/nativeBanks',nativeBanksRouter);
app.use('/suppliers', suppliersRouter);
app.use('/projects', projectsRouter);
app.use('/LCs', LCsRouter);
app.use('/documents',documents)
app.use('/info',info)
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  
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
