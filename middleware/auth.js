const jwt = require("jsonwebtoken");
const config = require("config");

// get token from header. becaause when we need access to a protected route, we need to pass our
// token with it so the site authenticates that we are allowed to be there
module.exports = function(req, res, next) {
  const token = req.header("x-auth-token");

  //check if token is not found
  if (!token) {
    return res.status(401).json({
      msg: "No token, authorization denied."
    });
  }

  //verify token, decode the token when you receive it, and verify that it is legit.
  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"));
    // set the user as the decoded user from the token.
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({
      msg: "token not valid"
    });
  }
};
