const express = require("express");
const auth = require("../../middleware/auth");
const router = express.Router();
const User = require("../../models/User");

/** @route GET api/auth
 *  @desc Test Route
 *  @access Public
 *  NOTICE, the auth being passed! this means the route is protected and only verified users have access to this route.
 */
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("send server error");
  }
});

module.exports = router;
