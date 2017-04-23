/**
 * Inserts a nicely formatted time signature to requests for easy timing of tweets.
 * @param req - The request.
 * @param res - The response.
 * @param next - The function to do after you've done the steps in the body of the middleware.
 */
module.exports = function (req, res, next) {
    req.date = Date.now();
    next();
};