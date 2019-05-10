const express = require("express");
const auth = require("../../middleware/auth");
const router = express.Router();
const User = require("../../models/User");
const { check, validationResult } = require("express-validator/check"); //check to make sure info sent from view is correct.
const jwt = require("jsonwebtoken");
const config = require("config");
const bcrypt = require("bcryptjs");

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

/** @route POST api/auth
 *  @desc Authenticate user and get token (login)
 *  @access Public
 */
router.post(
  "/",
  [
    check("email", "Please include valid email").isEmail(),
    check("password", "does not exist").exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      //meaning there are errors
      return res.status(400).json({
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    try {
      // see if users exist
      let user = await User.findOne({
        email
      });

      //if user false
      if (!user) {
        return res.status(400).json({
          errors: [
            {
              msg: "Invalid credentials"
            }
          ]
        });
      }
      //everything after this is if the user exist.
      //compare (plaintext user entered password to ciphertext password in database).
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({
          errors: [
            {
              msg: "Invalid credentials"
            }
          ]
        });
      }

      // return jsonwebtoken
      const payload = {
        user: {
          id: user.id //this id is from the user in the DB..
        }
      };
      //signing and creating a jwt. pass in payload, which includes the user id, pass in the secret, found in default.json, set an expiration on the token.
      //sign is callback function so it returns either an error or a token, so we can respond by sending the token to validate.
      jwt.sign(
        payload,
        config.get("jwtSecret"),
        {
          expiresIn: 360000
        },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("server error");
    }
  }
);

module.exports = router;
