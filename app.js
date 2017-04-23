var express = require("express");
var bodyParser = require('body-parser');
var mustache = require('mustache-express');
var moment = require('moment');
const $ = require('jquery');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var logger = require('morgan');

///////////////////////////////////////////////////////////
//                       Database                        //
///////////////////////////////////////////////////////////

// Reference: 6.170 mongo_recitation
var mongoose = require('mongoose');

//Reference: http://stackoverflow.com/questions/19339786/going-from-mongodb-to-mongolab-using-node-js
// mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/mydatabase');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
    console.log("database connected");
});

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/mymongodb');

///////////////////////////////////////////////////////////
//                       Express                         //
///////////////////////////////////////////////////////////

var app = express();
// Set directory for view files.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(__dirname + '/public'));


///////////////////////////////////////////////////////////
//                       Models                          //
///////////////////////////////////////////////////////////

var userModel = require('./models/userModel');
var tweetModel = require('./models/tweetModel');

///////////////////////////////////////////////////////////
//                       Controllers                     //
///////////////////////////////////////////////////////////

var users = require('./controllers/users');
var tweets = require('./controllers/tweets');

///////////////////////////////////////////////////////////
//                       Sessions                        //
///////////////////////////////////////////////////////////

// Initialize cookie parser and user session.
// Reference: http://technikyle.com/expressjs-session-tutorial/
app.use(cookieParser());
app.use(session({
    secret: 'boo',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge : 180000 } // ~ 3 min livespan
}));

// Reference: http://technikyle.com/expressjs-session-tutorial/
// Redirect user to login page if session.user doesn't exist (they aren't "logged in").
app.use(function restrict(req, res, next) {
    //allow users with an active session as well as login page access
    if (req.session.loggedInUser != undefined || req.url === '/login' || req.url === "/" || req.url === '/register') {
        next();
    } else {
        req.session.error = 'Access denied!';
        req.session.destroy();
        res.redirect('/');
    }
});

///////////////////////////////////////////////////////////
//                       Middlewares                     //
///////////////////////////////////////////////////////////

// Middleware to add date to requests.
app.use(require('./middlewares/times.js'));

///////////////////////////////////////////////////////////
//                       Routing                         //
///////////////////////////////////////////////////////////

app.use('/', users);
app.use('/tweets', tweets);


///////////////////////////////////////////////////////////
//                Invalid/Not-Found Pages                //
///////////////////////////////////////////////////////////

//Reference: 6.170 mongo_recitation
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            'message': err.message,
            'error': err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        'error': err.message
    });
});

// Handles not-found errors.
// Reference: http://stackoverflow.com/questions/6528876/how-to-redirect-404-errors-to-a-page-in-expressjs
app.use(function(req, res, next){
    res.status(404).render('404Message', {message: "Sorry, page not found"});
});

// Listen on port 3000 or deployment port.
app.listen(process.env.PORT || 3000, function() {
    console.log("Listening on port 3000");
});

module.exports = app;

