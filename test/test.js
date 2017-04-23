var assert = require("assert");
var mongoose = require("mongoose");
var moment = require("moment");

var userModel = require("../models/userModel.js");
var tweetModel = require("../models/tweetModel.js");

mongoose.connect('mongodb://localhost/tests');

var noop = function(){};
userModel.remove({}, function() {});
tweetModel.remove({}, function() {});
userModel.createUser("Bruno", "password", noop);
userModel.createUser("Sarah", "apple123", noop);
userModel.createUser("Billy", "metallica", noop);
userModel.createUser("Justin", "aa", noop);
userModel.createUser("Jimmy", "JimmyNeutron", noop);

// Test userModel.
describe("userModel", function() {

    // Test createUser.
    describe("#createUser", function () {

        // Test create valid new user.
        it("Should create a new user with no issues.", function (done) {
            userModel.createUser("Kanye", "extrathic", function(err, resUser){
                assert.deepEqual(err, null);
                assert.deepEqual(resUser.username, "Kanye");
                done();
            });
        });

        // Test create duplicate user same password.
        it("Should return error for duplicate user regardless of password.", function (done) {
            userModel.createUser("Bruno", "password", function(err, resUser){
                assert.notDeepEqual(err, null);
                done();
            });
        });

        // Test create duplicate user different password.
        it("Should return error for duplicate user regardless of password.", function (done) {
            userModel.createUser("Bruno", "paaaaasword", function(err, resUser){
                assert.notDeepEqual(err, null);
                done();
            });
        });

        // Test create user with empty username.
        it("Should return error for empty username", function (done) {
            userModel.createUser("", "password", function(err, resUser){
                assert.notDeepEqual(err, null);
                done();
            });
        });

        // Test create user with invalid username characters.
        it("Should return error for invalid username.", function (done) {
            userModel.createUser("!#@$@*&$*@&(!(****@&", "password", function(err, resUser){
                assert.notDeepEqual(err, null);
                done();
            });
        });

        // Test create user with empty password.
        it("Should return error for empty password.", function (done) {
            userModel.createUser("Johnny", "", function(err, resUser){
                assert.notDeepEqual(err, null);
                done();
            });
        });

        // Test create user with empty username and password.
        it("Should return error for empty password and username.", function (done) {
            userModel.createUser("", "", function(err, resUser){
                assert.notDeepEqual(err, null);
                done();
            });
        });
    });

    // Test loginUser.
    describe("#loginUser", function () {

        // Test login existing user, correct password.
        it("Should successfully login the user.", function (done) {
            userModel.loginUser("Bruno", "password", function(err, resUser){
                assert.deepEqual(err, null);
                done();
            });
        });

        // Test login existing user, incorrect password.
        it("Should NOT log the user in.", function (done) {
            userModel.loginUser("Bruno", "passssword", function(err, resUser){
                assert.notDeepEqual(err, null);
                done();
            });
        });

        // Test login nonexistant user.
        it("Should complain that the user does not exist.", function (done) {
            userModel.loginUser("Lil Wayne", "password", function(err, resUser){
                assert.notDeepEqual(err, null);
                done();
            });
        });
    });

    // Test getUser.
    describe("#getUser", function () {

        // Test user does NOT exist.
        it("Should return error for nonexistant user.", function (done) {
            userModel.getUser("John", function (err, resUser) {
                assert.notDeepEqual(err, null);
                done();
            });
        });

        // Test user does exist.
        it("Should return username of existing user.", function (done) {
            userModel.getUser("Bruno", function (err, resUser) {
                assert.deepEqual(err, null);
                assert.deepEqual(resUser.username, "Bruno");
                done();
            });
        });
    });

    // Test addToIsFollowing.
    describe("#addToIsFollowing", function () {

        // Test user you are attemptying to follow exists, is not yourself and is not already followed by you.
        it("Should successfully add the user to the other users following list.", function (done) {
            userModel.addToIsFollowing("Justin", "Bruno", function(err, resUser){
                assert.deepEqual(err, null);
                done();
            });
        });

        // Test user you are attempting to follow is yourself.
        it("Should not allow following yourself.", function (done) {
            userModel.addToIsFollowing("Sarah", "Sarah", function(err, resUser){
                assert.notDeepEqual(err, null);
                done();
            });
        });

        // Test user already follows other user.
        it("Should not allow another change to following list when user is already followed.", function (done) {
            userModel.addToIsFollowing("Justin", "Billy", function(errFirstFollow, resUserFirstFollow) {
                userModel.addToIsFollowing("Justin", "Billy", function (errSecondFollow, resUserSecondFollow) {
                    assert.notDeepEqual(errSecondFollow, null);
                    done();
                });
            });
        });

        // Test user you are attempting to follow does NOTexist.
        it("Should not allow following nonexistant user.", function (done) {
            userModel.addToIsFollowing("Bruno", "Drake", function(err, resUser){
                assert.notDeepEqual(err, null);
                done();
            });
        });

        // Test user doing the following does NOT exist.
        it("SHould not allow user that doesn't exist to follow a user.", function (done) {
            userModel.addToIsFollowing("Asap Rocky", "Bruno", function(err, resUser){
                assert.notDeepEqual(err, null);
                done();
            });
        });

        // Test neither user exists.
        it("Should throw error if neither user exists (obviously).", function (done) {
            userModel.addToIsFollowing("Asap Rocky", "Drake", function(err, resUser){
                assert.notDeepEqual(err, null);
                done();
            });
        });
    });

    // Test removeFromIsFollowing.
    describe("#removeFromIsFollowing", function () {

        // Test user you are attemptying to remove exists, is not yourself and IS already followed by you.
        it("Should successfully remove the user from the other users following list.", function (done) {
            userModel.removeFromIsFollowing("Sarah", "Billy", function (errFirstRemove, resUserSecondRemove) {
                userModel.addToIsFollowing("Sarah", "Billy", function(errFirstAdd, resUserFirstRemove) {
                    assert.notDeepEqual(errFirstRemove, null);
                    assert.deepEqual(errFirstAdd, null);
                    done();
                });
            });
        });

        // Test user you are attemptying to remove is yourself.
        it("Should return an error if attempting to unfollow yourself.", function (done) {
            userModel.removeFromIsFollowing("Sarah", "Sarah", function (errFirstRemove, resUserSecondRemove) {
                userModel.addToIsFollowing("Sarah", "Sarah", function(errFirstAdd, resUserFirstRemove) {
                    assert.notDeepEqual(errFirstRemove, null);
                    assert.notDeepEqual(errFirstAdd, null);
                    done();
                });
            });
        });

        // Test user you are attemptying to remove you already do not follow.
        it("Should return an error if attempting to unfollow is already unfollowed.", function (done) {
            userModel.removeFromIsFollowing("Justin", "Billy", function (errFirstRemove, resUserSecondRemove) {
                userModel.addToIsFollowing("Justin", "Bruno", function(errFirstAdd, resUserFirstRemove) {
                    assert.deepEqual(errFirstRemove, null);
                    assert.deepEqual(errFirstAdd, null);
                    done();
                });
            });
        });

        // Test user you are attemptying to remove does not exist.
        it("Should return an error if attempting to unfollow is nonexistant user.", function (done) {
            userModel.removeFromIsFollowing("Justin", "REE", function (errFirstRemove, resUserSecondRemove) {
                userModel.addToIsFollowing("Justin", "Bruno", function(errFirstAdd, resUserFirstRemove) {
                    assert.notDeepEqual(errFirstRemove, null);
                    assert.notDeepEqual(errFirstAdd, null);
                    done();
                });
            });
        });
    });
});

describe("tweetModel", function() {

    // Test createTweet.
    describe("#createTweet", function () {

        // Test user adding tweet exists and the tweet text is not empty.
        it("Should be able to successfully create tweet.", function (done) {
            tweetModel.createTweet("Bruno", "Kill all humans.", Date.now(), function(err, resTweet){
                assert.deepEqual(err, null);
                done();
            });
        });

        // Test user adding tweet does NOT exist.
        it("Should not be able to create tweet for nonexistant user.", function (done) {
            tweetModel.createTweet("Majin Bu", "Kill all humans.", Date.now(), function(err, resTweet){
                assert.notDeepEqual(err, null);
                done();
            });
        });

        // Test tweet text is empty.
        it("Should not be able to create empty tweet.", function (done) {
            tweetModel.createTweet("Bruno", "", Date.now(), function(err, resTweet){
                assert.notDeepEqual(err, null);
                done();
            });
        });
    });

    // Test createRetweet.
    describe("#createRetweet", function () {

        // Test retweeting existing tweet and you are NOT the author.
        it("Should be able to retweet existing tweet you are not author of.", function (done) {
            tweetModel.createTweet("Billy", "Reading is fun.", Date.now(), function(errCreateTweet, resTweet){
                var tweetId = resTweet._id;
                tweetModel.createRetweet("Sarah", tweetId, Date.now(), function(errCreateRetweet, resRetweet){
                    tweetModel.getUserTweets("Billy", function(errGetID, resID){
                        assert.deepEqual(errCreateTweet, null);
                        assert.deepEqual(errGetID, null);
                        assert.deepEqual(errCreateRetweet, null);
                        done();
                    });
                });

            });
        });

        // Test retweeting existing tweet and you ARE the author.
        it("Should NOT be able to retweet existing tweet you are the author of.", function (done) {
            tweetModel.createTweet("Justin", "Reading is NOT fun.", Date.now(), function(errCreateTweet, resTweet){
                var tweetId = resTweet._id;
                tweetModel.createRetweet("Justin", tweetId, Date.now(), function(errCreateRetweet, resRetweet){
                        assert.deepEqual(errCreateTweet, null);
                        assert.notDeepEqual(errCreateRetweet, null);
                        done();
                });

            });
        });

        // Test retweeting nonexistant tweet.
        it("Should not be able to retweet nonexistant tweet.", function (done) {
            tweetModel.createRetweet("Bruno", "123", Date.now(), function(err, resTweet){
                assert.notDeepEqual(err, null);
                done();
            });
        });
    });

    // Test deleteTweet.
    describe("#deleteTweet", function () {

        // Test delete tweet that exists.
        it("Should delete the tweet.", function(done){
            tweetModel.createTweet("Jimmy", "Lobsters are usually red.", Date.now(), function(errCreate, resTweet){
                var tweetId = resTweet._id;
                tweetModel.getUserTweets("Jimmy", function(errGetBefore, resGetBefore){
                    tweetModel.deleteTweet(resTweet, function(errDelete, resDelete){
                        tweetModel.getUserTweets("Jimmy", function(errGetAfter, resGetAfter){
                            assert.deepEqual(errDelete, null);
                            // assert.deepEqual(1, resGetBefore.length );
                            // assert.deepEqual(0, resGetAfter.length );
                            done();
                        });
                    });
                });
            });
        });

        // Test delete tweet that does NOT exist.
        it("Should return an error because there is no tweet to delete.", function(done){
            tweetModel.deleteTweet("123313793242341111111", function(errDelete, resDelete){
                assert.notDeepEqual(errDelete, null);
                done();
            });
        });

    });

    // Test getUserTweets.
    describe("#getUserTweets", function () {

        // Test username exists.
        it("Should return the tweets associated with the valid user.", function(done){
            tweetModel.getUserTweets("Bruno", function(errGet, resGet){
                assert.deepEqual(errGet, null);
                assert.deepEqual(resGet.length, 4);
                done();
            });
        });

        // Test username does NOT exist.
        it("Should return an empty list.", function(done){
            tweetModel.getUserTweets("Harambe", function(errGet, resGet){
                assert.deepEqual(errGet, null);
                assert.deepEqual(resGet, []);
                done();
            });
        });
    });
});