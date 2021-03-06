require('dotenv').config();
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');

var app = express();

// Mongoose
var mongoose = require('mongoose');
var configDb = require('./config/database');
mongoose.connect(configDb.url,{useMongoClient:true});
mongoose.connection.on('connected', function () {
    console.log('Mongoose default connection connected')
});
mongoose.connection.on('error', function (err) {
    console.log('Mongoose default connection error:'+err)
});
mongoose.connection.on('disconnected', function () {
    console.log('Mongoose default connection disconnected')
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');


//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
require('./config/passport')(passport);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret:process.env.SESSION_SECRET, resave:true, saveUninitialized:true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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


process.on('SIGINT', function () {
    mongoose.connection.close(function () {
        console.log("Mongoose default connection disconnected on app termination");
        process.exit(0);
    });
});

module.exports = app;
