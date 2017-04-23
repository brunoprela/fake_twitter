var mongoose = require('mongoose');
var _ = require('underscore');

// Import user model.
var userModel = require('./userModel');

// Initialize tweet model schema.
var tweetSchema = new mongoose.Schema({
    retweet: Boolean,
    userAuthoredName: String,
    userRetweetedName: String,
    text: String,
    time: String
});

/**
 * Create a tweet.
 * @param username - The name of the user who wrote the tweet.
 * @param text - The text contained in the tweet.
 * @param time - The time the tweet was posted.
 * @param cb - The callback.
 */
tweetSchema.statics.createTweet = function(username, text, time, cb){
    // Check that the tweet text is not empty.
    if (text.length > 0){
        userModel.getUser(username, function(err, resUser){

            if (err){ // Username does not exist. Cannot post tweet.
                cb("Username does not exist. How did you even log in??!");
            } else { // Username does exist, create new tweet and post it.
                var user = resUser;
                var newTweet = new tweetModel({retweet : false, userAuthoredName : username,
                                            userRetweetedName : null, text : text, time : time});
                newTweet.save(cb);
            }
        });
    } else { // Tweet text is empty.
        cb("Tweet is empty!");
    }
};

/**
 * Create a retweet (tweet with retweet field === true).
 * @param username - The name of the user who wrote the tweet.
 * @param tweetId - The id of the tweet you are attempting to retweet.
 * @param time - The time the tweet is retweeted.
 * @param cb - The callback.
 */
tweetSchema.statics.createRetweet = function(username, tweetId, time, cb){
    this.find( {_id : tweetId}, function(errTweet, resTweet){
       if (errTweet){
           cb(errTweet);
       } else if (resTweet.length === 0){ // Tweet trying to be retweeted does not exist.
           cb("Tweet you are trying to retweet does NOT exist.");
       } else if (resTweet[0].retweet){ // Tweet is already a retweet. Not allowed to retweet twice.
           cb("Tweet is already a retweet!");
       } else if (username){ // Create retweet from found tweet.
           var tweet = resTweet[0];

           userModel.getUser(username, function(errUser, resUser){
               if (errUser) {
                   cb("Username is invalid!");
               } else if (username === resTweet[0].userAuthoredName){ // Check if user is trying to retweet own tweet.
                   cb("Tweet you are trying to retweet is your own tweet!");
               } else if (resTweet[0].retweet){
                   cb("Tweet is already a retweet!");
               } else {
                   var user = resUser;
                   var newRetweet = new tweetModel({retweet : true,
                                                userAuthoredName : tweet.userAuthoredName,
                                                userRetweetedName : user.username,
                                                text : tweet.text, time : time});
                   newRetweet.save(cb);
               }
           });
       }
    });
};

/**
 * Delete a tweet in the database.
 * @param tweetId - The id of the tweet to delete.
 * @param cb - The callback.
 */
tweetSchema.statics.deleteTweet = function(tweetId, cb){
    this.remove({_id : tweetId}, function(err, resTweetDelete){
       if (err){
           cb(err);
       } else{
           cb(null);
       }
    });
};

/**
 * Get all tweets associated with a given username.
 * @param username - The username we wan't to filter tweets with.
 * @param cb - The callback.
 */
tweetSchema.statics.getUserTweets = function(username, cb){
    if (username.length){
        this.find({}, function(errFind, resTweets){
            if (errFind){
                cb(errFind);
            } else {
                userModel.getUser(username, function(errGet, resUserTweets){
                    if (errGet){
                        var noTweets = [];
                        cb(null, noTweets);
                    } else{
                        cb(null, resTweets);
                    }
                });
            }
        });
    }
    else {
        var noTweets = [];
        cb("Empty username!", noTweets);
    }
};

var tweetModel = mongoose.model('tweetModel', tweetSchema);
module.exports = tweetModel;