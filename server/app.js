var createError = require('http-errors');
var express = require('express');
var path = require('path');
var compass = require('node-compass');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var httpLogger = require('./utils/logUtils').getLogger("http");

var indexRouter = require('./routes');
var usersRouter = require('./routes/users');
var gamesRouter = require('./routes/games.router');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

const MORGAN_FORMAT_NORMALIZE_REPLACE_REGEXP = /\[\d+m/g;
const NEWLINES_REPLACE_REGEXP = /(?:\r\n|\r|\n)/g;
app.use(morgan('dev', {
    format: 'dev',
    stream: {
        write: str => {
            httpLogger.info(str
                .replace(MORGAN_FORMAT_NORMALIZE_REPLACE_REGEXP, '')
                .replace(NEWLINES_REPLACE_REGEXP, ''))
        }
    }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(compass({ mode: 'expanded' }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/games', gamesRouter);

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
