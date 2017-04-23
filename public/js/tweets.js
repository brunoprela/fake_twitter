$(function() {

    /**
     * Allows a user to delete his/her own tweet.
     */
    $(document).on("click", ".delete-submit", function() {
        var button = $(this);

        /**
         * Requests to delete the parent (div) of the button clicked.
         * This deletes the tweet from the '/tweets' view.
         */
        $.ajax({
            type: 'DELETE',
            url: "/tweets/delete/" + button.attr("id"),
            success: function () {
                button.parent().remove();
            }
        });
    });

    /**
     * Allows user to follow another user after having checked out that other user's profile.
     */
    $(document).on("click", ".follow-submit", function() {
        var button = $(this);

        /**
         * Requests to retweet the parent (div) of the button clicked.
         * This deletes the follow button from the '/tweets/follow/:username' view.
         */
        $.ajax({
            type: 'POST',
            url: "/tweets/follow/" + button.attr("id"),
            success: function () {
                button.remove();
            }
        });
    });

    /**
     * Allows a user to retweet a tweet from the main newsfeed.
     */
    $(document).on("click", ".retweet-submit-all", function() {
        var button = $(this);

        $.ajax({
            type: 'POST',
            url: "/tweets/retweet/" + button.attr("id"),
            success: function () {
                $('#'+ button.attr("id")).find();
                button.remove();
                window.location = '/tweets/allNewsfeed';
            }
        });
    });

    /**
     * Allows a user too retweet a tweet from their own newfeed.
     */
    $(document).on("click", ".retweet-submit-my", function() {
        var button = $(this);

        $.ajax({
            type: 'POST',
            url: "/tweets/retweet/" + button.attr("id"),
            success: function () {
                $('#'+ button.attr("id")).find();
                button.remove();
                window.location = '/tweets/myNewsfeed';
            }
        });
    });

});