const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");

const Profile = require("../../models/User");

/** @route GET api/profile/me
 *  @desc get current users profile
 *  @access profile
 */
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id
    }).populate("user", ["name", "avatar"]);

    if (!profile) {
      return res.status(400).json({
        msg: "no profile for user"
      });
    }

    res.json(profile);
  } catch (err) {
    console.errpr(err.message);
    res.status(500).send("server Error");
  }
});

module.exports = router;
