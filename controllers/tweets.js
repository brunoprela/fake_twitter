var express = require('express');
var router = express.Router();
var moment = require('moment');

var userModel = require('../models/userModel');
var tweetModel = require('../models/tweetModel');


/**
 * Display the main twitter newfeed containing all tweets and the ability to post new tweets.
 */
router.get('/allNewsfeed', function(req, res){
    tweetModel.find({}, function (errFind, resFind) {
        if (errFind) {
            res.send({'success': false, 'message': errFind.message});
        } else {
            userModel.getUser(req.session.loggedInUser, function(errGet, resGet){
                if(errGet){
                    res.send({'success': false, 'message': errGet.message});
                } else{
                    resFind.forEach(function (tweet) {
                        tweet['isUsersTweet'] = tweet.userAuthoredName === req.session.loggedInUser;
                        tweet['isUsersRetweet'] = tweet.userRetweetedName === req.session.loggedInUser;
                    });
                    var formattedTweets = resFind.map(function (item) {
                        var retweet = item.retweet;
                        var authorName = item.userAuthoredName;
                        var retweeterName = item.userRetweetedName;
                        var text = item.text;
                        var time = item.time;
                        var id = item._id;
                        var isUsersTweet = item.isUsersTweet;
                        var isUsersRetweet = item.isUsersRetweet;
                        return {"retweet": retweet, "text": text, "time": time, "id": id, 'userAuthoredName' : authorName,
                            'userRetweetedName': retweeterName, 'isUsersTweet':isUsersTweet, 'isUsersRetweet':isUsersRetweet};
                    });
                    res.render('allNewsfeed.ejs', {username: req.session.loggedInUser, allTweets: formattedTweets.reverse(), "isValid": true});
                }
            });
        }
    });
});

/**
 * Display a list of tweets tweeted by/retweeted by/retweeted of users the current user is following.
 */
router.get('/myNewsfeed', function(req, res){
    tweetModel.find({}, function (errFind, resFind) {
        if (errFind) {
            res.send({'success': false, 'message': errFind.message});
        } else {
            userModel.getUser(req.session.loggedInUser, function(errGet, resGet){
                if(errGet){
                    res.send({'success': false, 'message': errGet.message});
                } else{
                    var followingList = resGet.isFollowing;
                    resFind.forEach(function (tweet) {
                        tweet['isUsersTweet'] = tweet.userAuthoredName === req.session.loggedInUser;
                        tweet['isUsersRetweet'] = tweet.userRetweetedName === req.session.loggedInUser;
                        tweet['isFollowing'] = followingList.indexOf(tweet.userAuthoredName) > -1;
                    });
                    var formattedTweets = resFind.map(function (item) {
                        var retweet = item.retweet;
                        var authorName = item.userAuthoredName;
                        var retweeterName = item.userRetweetedName;
                        var text = item.text;
                        var time = item.time;
                        var id = item._id;
                        var isUsersTweet = item.isUsersTweet;
                        var isUsersRetweet = item.isUsersRetweet;
                        var isFollowing = item.isFollowing;
                        return {"retweet": retweet, "text": text, "time": time, "id": id, 'userAuthoredName' : authorName,
                            'userRetweetedName': retweeterName, 'isUsersTweet':isUsersTweet, 'isUsersRetweet':isUsersRetweet,
                            'isFollowing': isFollowing};
                    });
                    res.render('myNewsfeed.ejs', {username: req.session.loggedInUser, myTweets: formattedTweets.reverse()});
                }
            });
        }
    });
});

/**
 * Display a list of tweets tweeted by/retweeted by/retweeted of users the selected user is following.
 * Similar to a profile view. Also allows curent user to follow this other user after seeing their feed.
 */
router.get('/:username', function(req, res){
    if(req.session.loggedInUser === req.params.username){
        res.redirect('/tweets/myNewsfeed');
    } else{
        tweetModel.find({}, function (errFind, resFind) {
            if (errFind) {
                res.send({'success': false, 'message': errFind.message});
            } else {
                userModel.getUser(req.params.username, function(errGet, resGet){
                    if(errGet){
                        res.send({'success': false, 'message': errGet.message});
                    } else{
                        var followingList = resGet.isFollowing;
                        if (resFind.length === 0){
                            var isFollowingUser = followingList.indexOf(req.session.loggedInUser) > -1;
                            var otherUser = req.params.username;
                            res.render('userNewsfeed.ejs', {username: req.session.loggedInUser, userTweets: [],
                                otherUser: otherUser, isFollowingUser: isFollowingUser});
                        } else {
                            resFind.forEach(function (tweet) {
                                tweet['isUsersTweet'] = tweet.userAuthoredName === req.params.username;
                                tweet['isUsersRetweet'] = tweet.userRetweetedName === req.params.username;
                                if (tweet.retweet){
                                    tweet['isFollowing'] = followingList.indexOf(tweet.userAuthoredName) > -1;
                                } else {
                                    tweet['isFollowing'] = followingList.indexOf(tweet.userRetweetedName) > -1;
                                }
                            });
                            var formattedTweets = resFind.map(function (item) {
                                var retweet = item.retweet;
                                var authorName = item.userAuthoredName;
                                var retweeterName = item.userRetweetedName;
                                var text = item.text;
                                var time = item.time;
                                var id = item._id;
                                var isUsersTweet = item.isUsersTweet;
                                var isUsersRetweet = item.isUsersRetweet;
                                var isFollowing = item.isFollowing;
                                return {"retweet": retweet, "text": text, "time": time, "id": id, 'userAuthoredName' : authorName,
                                    'userRetweetedName': retweeterName, 'isUsersTweet':isUsersTweet, 'isUsersRetweet':isUsersRetweet,
                                    'isFollowing': isFollowing};
                            });

                            var isFollowingUser = followingList.indexOf(req.session.loggedInUser) > -1;
                            // var isFollowing = false;
                            var otherUser = req.params.username;

                            res.render('userNewsfeed.ejs', {username: req.session.loggedInUser, userTweets: formattedTweets.reverse(),
                                otherUser: otherUser, isFollowingUser: isFollowingUser});
                        }


                    }
                });
            }
        });
    }

});

/**
 * Post a tweet and display it in the newsfeed.
 */
router.post('/tweet', function(req, res){
    var time = moment(req.date).format('MMMM Do YYYY, h:mm:ss a');
    tweetModel.createTweet(req.session.loggedInUser, req.body.tweetText, time, function (errCreate, resCreate) {
        if (errCreate) {
            console.log(errCreate.message);
        } else {
            res.redirect('/tweets/allNewsfeed');
        }
    });
});


/**
 * Post a retweet and display it in the newsfeed.
 */
router.post('/retweet/:id', function(req, res){
    var time = moment(req.date).format('MMMM Do YYYY, h:mm:ss a');
    tweetModel.createRetweet(req.session.loggedInUser, req.params.id, time, function (errCreate, resCreate) {
        if (errCreate) {
            res.send({'message': errCreate.message});
        } else {
            res.send({'success':true});
        }
    });
});


/**
 * Delete a tweet and remove it from the newsfeed.
 */
router.delete('/delete/:id', function(req, res) {
    tweetModel.deleteTweet(req.params.id, function(errDelete, resDelete){
        if(errDelete){
            res.send({'message': errDelete.message});
        } else {
            res.send({'success': true});
        }
    });
});


/**
 * Follow a user and remove the button allowing you to follow them again.
 */
router.post('/follow/:username', function(req, res) {
    userModel.addToIsFollowing(req.session.loggedInUser, req.params.username, function(errAdd, resAdd){
        if(errAdd){
            res.send({'message': errAdd.message});
        } else {
            res.send({'success': true});
        }
    });
});

module.exports = router;
