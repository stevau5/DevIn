const express = require("express");
const router = express.Router();
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
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      //meaning there are errors
      return res.status(400).json({
        errors: errors.array()
      });
    }

    res.send("User Router");
  }
);

module.exports = router;
