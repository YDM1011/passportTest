const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const favicon = require('serve-favicon');
const logger = require('morgan');
const data = require('./config');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
require('./appServer/models/index');
const app = express();

app.set('views', path.join(__dirname, './appServer/views'));
app.set('view engine', 'ejs');

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const passport = require('passport');
const social = require('./appServer/controlers/passport')(app, passport);

const routes = require('./appServer/models/routes');
app.use('/', routes);


// var request = require('request');
// request('http://localhost:5000', function (error, response, body) {
//     console.log('error:', error); // Print the error if one occurred
//     console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
//     console.log('body:', body); // Print the HTML for the Google homepage.
// });
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    const err = new Error('ops, this page not found');
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

module.exports = app;
