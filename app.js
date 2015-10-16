var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//connect-mongodb as the storing device for http session
var session = require('express-session');  
var Settings = require('./database/settings');  
var MongoStore = require('connect-mongodb');  
var db = require('./database/msession'); 

// routes middleware setup
var routes = require('./routes/index');
//var users = require('./routes/users');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//app.engine('html', require('ejs').renderFile);
//app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//http session configuration, use req.session to access session data
//see a detailed menu of session options in express-session module readme
app.use(session({
     cookie: { maxAge: 600000 },
     secret: Settings.COOKIE_SECRET,
     store: new MongoStore({  
         username: Settings.USERNAME,
         password: Settings.PASSWORD,
         url: Settings.URL,
         db: db})
 }));

//load session user 
 app.use(function(req, res, next){
     res.locals.user = req.session.user;
     var err = req.session.error;
     delete req.session.error;
     res.locals.message = '';
     if (err) {
        res.locals.message = '<div class="alert alert-warning">' + err + '</div>';
     }
     next();
 });
// routing middleware setup
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', routes);
app.use('/userprofile', routes);
app.use('/login', routes);
app.use('/logout', routes);
app.use('/summary', routes);
app.use('/register', routes);
app.use('/create', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
