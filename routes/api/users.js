const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require('config');
const { check, validationResult } = require("express-validator");

const User = require("../../models/User");

// @ route  Post api/users
// @ desc   Register User
// @ access public
router.post(
  "/",
  [
    check("name", "Name is required")
      .not()
      .isEmpty(),
    check("email", "Please Validate email").isEmail(),
    check(
      "password",
      "Please Enter a password with 6 or more character"
    ).isLength({ min: 6 }),
    check("phone", "Please enter 10 digit phone number").isLength({ min: 10 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // see if user exists
    const { name, email, password, phone } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User Already exists" }] });
      }

      const avatar = gravatar.url(email, {
        s: '200 ',
        r: 'pg',
        d: 'mm'
      })

      user = new User({
        name,
        email,
        password,
        avatar,
        phone
      });

      // Encrypt password
      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      // Insert User
      await user.save();

      // Return jsonwebtoken
      const payload = {
          user: {
              id: user._id
          }
      }

      jwt.sign(payload, config.get('jwtSecret'),
      
      { expiresIn: 360000 },
      (err, token) => {
            if(err) throw err;
            res.json({ token });
      }
      )

    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
