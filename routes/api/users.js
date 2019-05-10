const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");

const { check, validationResult } = require("express-validator/check"); //check to make sure info sent from view is correct.

/** @route POST api/users
 *  @desc Register User
 *  @access Public
 */
router.post(
  "/",
  [
    check("name", "Name is required")
      .not()
      .isEmpty(),
    check("email", "Please include valid email").isEmail(),
    check("password", "please enter pass with 6 or more characters").isLength({
      min: 6
    })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      //meaning there are errors
      return res.status(400).json({
        errors: errors.array()
      });
    }

    const { name, email, password } = req.body;

    try {
      // see if users exist
      let user = await User.findOne({
        email
      });

      //if user exists
      if (user) {
        return res.status(400).json({
          errors: [
            {
              msg: "User already exists"
            }
          ]
        });
      }
      //everything after this is if the user doesn't exist.
      // get users gravatar
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm"
      });

      user = new User({
        name,
        email,
        avatar,
        password
      });

      // encrypt  password, generate salt, then encrypt with plaintext password.
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

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
