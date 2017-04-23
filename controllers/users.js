var express = require('express');
var router = express.Router();

var userModel = require('../models/userModel');
var tweetModel = require('../models/tweetModel');


/**
 * Redirects user to login page.
 */
router.get('/', function(req, res){
    res.redirect('/login');
});

/**
 * Logs the user out if already logged in and prompts them to log in or register.
 */
router.get('/login', function(req, res){
    req.session.loggedInUser = undefined;
    req.session.save();
    res.render('login.ejs', {register:false, alreadyUser:false, invalidUser:false});
});

/**
 * Login a user with valid credentials and render the main newsfeed page.
 */
router.post('/login', function(req, res){
    var loginUsername = req.body.username;
    var loginPassword = req.body.password;

    userModel.loginUser(loginUsername, loginPassword, function(errLogin, resLogin) {
        if (errLogin){
            res.render('login.ejs', {register:false, alreadyUser:false, invalidUser:true});
        } else{
            req.session.loggedInUser = loginUsername;
            req.session.save();
            res.redirect('/tweets/allNewsfeed');
        }
    });
});

/**
 * Register a new user with a unique username and render the main newsfeed page (auto log them in).
 */
router.post('/register', function(req, res){
    userModel.createUser(req.body.username, req.body.password, function (errCreate, resCreate) {
        if (errCreate) {
            // 'Username is already taken or password is invalid. Please try again.'
            res.render('login.ejs', {register:true, alreadyUser:true, invalidUser:false});
        } else {
            req.session.loggedInUser = req.body.username;
            req.session.save();
            res.redirect('/tweets/allNewsfeed');
        }
    });
});


module.exports = router;