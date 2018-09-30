const appRoot = require('app-root-path');
const winston = require('winston')
const { combine, timestamp, label, printf, prettyPrint } = winston.format;
path = require('path');

const logRootPath = `${appRoot}/logs/`
const levels = {
    error: 0,
    warning: 1,
    audit: 2,
    info: 3,
    debug: 4,
  };

const colors = {
  info: 'green',
  warning: 'orange',
  debug: 'yellow',
  error: 'red',
  audit: 'blue'
}

const config = {
  levels: levels,
  colors: colors
}

//winston.setLevels(levels)
winston.addColors(config.colors)

const myFormat = printf(info => {
  return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}: ${info.user}`;
});

var options = {
  file: {
    level: 'info',
    filename: `${appRoot}/logs/app.log`,
    handleExceptions: false,
    json: true,
    timeStamp: true,
    colorize: false,
  },
  console: {
    level: 'debug',
    handleExceptions: false,
    json: false,
    colorize: true,
    timeStamp: true,
  },
};



var defaultLogger = winston.createLogger({
  levels: config.level,
  transports: [
    new winston.transports.File(options.file),
    new winston.transports.Console(options.console)
  ],
  exitOnError: true, // do not exit on handled exceptions
});

defaultLogger.stream = {
  write: function(message, encoding) {
    defaultLogger.info({
      level: 'info',
      message: message
    });
  },
};

//options will only have filename
function createLogger(filename){
  var newOptions = options;
  newOptions.file.filename = logRootPath + filename;
  var logger = winston.createLogger({
    format:combine(
      label({ label: filename.split('.')[0] }),
      timestamp(),
      prettyPrint()
    ),
    levels: config.levels,
    transports: [
      new winston.transports.File(newOptions.file),
      new winston.transports.Console(options.console)
    ],
    exitOnError: true,
  });

  return logger;
}

module.exports = {
  defaultLogger,
  createLogger
};