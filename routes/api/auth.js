const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const auth = require("../../middleware/auth");
const config = require('config');
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const User = require('../../models/User');

// @ route  GET api/auth
// @ desc   Test route
// @ access public
router.get('/', auth, async (req, res) => {
        try{
              const user = await User.findById(req.user.id).select('-password');
              res.json(user);
            } catch(err) {
              console.error(err.message);
              res.status(500).send('Server Error');
        }
  
});


// @ route  Post api/auth
// @ desc   authenticate User and get token
// @ access public
router.post(
  "/",
  [
    
    check("email", "Please Validate email").isEmail(),
    check(
      "password",
      "Please is required"
    ).exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // see if user exists
    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }


      const isMatch = await bcrypt.compare(password, user.password);

      if(!isMatch) {
        return res
        .status(400)
        .json({ errors: [{ msg: "Invalid Credentials" }] });
      }
      
    
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
