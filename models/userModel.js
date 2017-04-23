var mongoose = require('mongoose');
var _ = require('underscore');

// Initialize user model schema.
var userSchema = new mongoose.Schema({
    username: String,
    password: String,
    isFollowing: [String]
});

/**
 * Creates a user with the given username and password if the credentials are valid and
 * a user does not already exist with that name.
 * @param username {String} - The username of the user.
 * @param password {String} - The password of the user.
 * @param cb - Returns username if user is created, or gives an informative error message.
 */
userSchema.statics.createUser = function(username, password, cb) {
    // Check that username is valid.
    // Reference: http://stackoverflow.com/questions/7331289/javascript-function-valid-username
    // Checks that username is composed of alphanumeric characters or -_.
    function usernameValid(username) {
        var validcharacters = '1234567890-_.abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (var i = 0, l = username.length; i < l; ++i) {
            return validcharacters.indexOf(username.substr(i, 1)) != -1;
        }
    }
    // Check that username is not just a different caps repeat.
    var usernameLower = username.toLowerCase();
    // Check that password is valid.
    var passwordIsString = _.isString(password);
    var passwordIsNotEmpty = password.length > 0;

    if (username.length > 0 && usernameValid(username)){ // Username is valid.
        if (passwordIsString && passwordIsNotEmpty){ // Password is valid.
            this.find({username : username}, function(err, resUsername){
                if (err) {
                    cb(err);
                } else if (!resUsername.length){ // TODO: Hash passwords before adding them to database.
                    var newUser = new userModel({ username: username, password : password, isFollowing : [] });
                    newUser.save(function(err, resSave) {
                        if (err) {
                            cb(err);
                        } else {
                            cb(null, { username: username });
                        }
                    })
                } else { // User already exists with that name.
                    cb("User with same name already exists!");
                }
            })
        } else { // Password is not valid.
            cb("Invalid password! Please try again.");
        }
    } else { // Username is not valid.
        cb("Invalid username! Please try again.");
    }
};

/**
 * Checks if the user can be logged in with the given credentials.
 * @param username {String} - The username credential.
 * @param password {String} - The password credential.
 * @param cb - Returns username if user can be logged in, or gives an informative error message.
 */
userSchema.statics.loginUser = function(username, password, cb){
    this.find({username : username}, function(err, resUsername){
       if (err){
           cb(err);
       } else if (resUsername.length){
           var resUser = resUsername[0];
           if (resUser.password === password){
               cb(null, {username:username});
           } else {
               cb("Incorrect credentials. Please try again.");
           }
       } else {
           cb("User does not exist. Please register.");
       }
    });
};

/**
 * Gets the user with the given username.
 * @param username {String} - Username of user to return.
 * @param cb - Returns username, isFollowing and user id, or notifies that the user doesn't exist.
 */
userSchema.statics.getUser = function(username, cb){
    this.find({username : username }, function(err, resUsername){
        if (err){
            cb(err);
        } else if (resUsername.length) {
            var user = resUsername[0];
            cb(null, {username : username, isFollowing : user.isFollowing, id : user._id});
        } else{
            cb("User does not exist.");
        }
    });
};

/**
 * Adds a user to follow for another user.
 * @param usernameFollowing - The username of the user wanting to follow the other.
 * @param usernameToFollow - The username of the user to follow.
 * @param cb - Update the followers list of the user, or give an informative error message.
 */
userSchema.statics.addToIsFollowing = function(usernameFollowing, usernameToFollow, cb){
    userModel.find({username : usernameFollowing}, function(errFollowing, resFollowingUsername){
        userModel.find({username : usernameToFollow}, function(errToFollow, resUsernameToFollow){
            if (errFollowing){
                cb(errFollowing);
            } else if (errToFollow){
                cb(errToFollow);
            } else if (!resFollowingUsername.length || !resUsernameToFollow.length){
                cb("Username of user to follow OR username of following not found. Please try again.");
            } else if (usernameToFollow === usernameFollowing){ // Both usernames are same.
                cb("Both usernames are the same. No self-following allowed.");
            } else if(resFollowingUsername[0].isFollowing.indexOf(usernameToFollow) > -1) { // Already follows.
                cb("User already follows user to follow.");
            } else {
                // Get the user to follow user model.
                var usernameToFollowRes = resFollowingUsername[0];
                // Valid add to following.
                var updatedIsFollowing = usernameToFollowRes.isFollowing;
                updatedIsFollowing.push(usernameToFollow);
                userModel.update({username : usernameFollowing}, {isFollowing : updatedIsFollowing}, cb);
            }
        });
    });
};

/**
 * Removes a user from list of users followed for another user.
 * @param usernameFollowing - The username of the user following.
 * @param usernameToRemove - The username of the user being followed, but which should no longer be followed.
 * @param cb - Update the followers list of the user, or give an infromative error message.
 */
userSchema.statics.removeFromIsFollowing = function(usernameFollowing, usernameToRemove, cb){
    userModel.find({username : usernameFollowing}, function(errRemoving, resFollowingUsername){
        userModel.find({username : usernameToRemove}, function(errToRemove, resUsernameToRemove){
            if (errRemoving){
                cb(errRemoving);
            } else if (errToRemove){
                cb(errToRemove);
            } else if (!resFollowingUsername.length || !resUsernameToRemove.length){ // Either or both don't exist.
                cb("Username of user to remove OR username of current following not found. Please try again.");
            } else if (usernameFollowing === usernameToRemove){ // Both usernames are same.
                cb("Both usernames are the same. No self-following allowed.");
            } else if (resFollowingUsername[0].isFollowing.indexOf(usernameToRemove) > -1){ // Valid remove.
                var updatedIsFollowingRemove = resUsernameToRemove[0].isFollowing;

                // Remove from isFollowing.
                var removeIndex = updatedIsFollowingRemove.indexOf(usernameToRemove);
                updatedIsFollowingRemove.splice(removeIndex, 1);
                userModel.update({username : usernameFollowing}, {isFollowing : updatedIsFollowingRemove}, cb);

            } else { // User is not even in isFollowing list of the other user.
                cb("User does not follow this other user already!");
            }
        });
    });
};

var userModel = mongoose.model('userModel', userSchema);
module.exports = userModel;