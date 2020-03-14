const express = require("express");
const request = require("request");
const config = require('config');
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
// @ route  GET api/Post
// @ desc   Get Current User
// @ access Private

router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      User: req.user.id
    }).populate("user", ["name", "avatar", "phone"]);

    if (!profile) {
      return res.status(400).json({ msg: "There is no profile this user" });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @ route  POST api/profile
// @ desc   create or update profile
// @ access

router.post(
  "/",
  [
    auth,
    [
      check("status", "status is required")
        .not()
        .isEmpty(),
      check("skills", "Skills is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin
    } = req.body;

    // Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(",").map(skill => skill.trim());
    }

    // Build Social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        console.log(profile);
        return res.json(profile);
        
      }

      
      profile = new Profile(profileFields);

      await profile.save();
      
      res.json(profile);

     
    } catch(err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);


// @ route  Get api/profile
// @ desc   Get All Profile
// @ access public


router.get('/', async(req, res) => {
      try{
          const profile = await Profile.find().populate('user', ['name', 'avatar', 'phone'])
          res.json(profile) 
      } catch(err) {
          console.error(err.message);
          res.status(500).send('Server Error')
      }
})


// @ route  Get api/profile/user/:user_id
// @ desc   Get Profile by user ID
// @ access public

router.get('/user/:user_id', async (req, res) => {
  try{
      const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar', 'phone']);
      if(!profile) return res.status(400).json({ msg: 'Profile Not Found' });
      res.json(profile); 
  } catch(err) {
      console.error(err.message);
      if(err.kind == 'objectId'){
        return res.status(400).json({ msg: 'Profile Not Found' });
      }
      res.status(500).send('Server Error');
  }
})


// @ route  Delete api/profile
// @ desc   Delete profile, user $ posts
// @ access Private


router.delete('/', auth, async(req, res) => {
  try{
      // @todo remove user post
      // Remove Profile
       await Profile.findOneAndRemove( { user: req.user.id } );

       await User.findOneAndRemove( { _id: req.user.id } );
      res.json( {msg : 'User deleted'} ) 
  } catch(err) {
      console.error(err.message);
      res.status(500).send('Server Error')
  }
});


// @ route  PUT api/profile/experience
// @ desc   add profile experience
// @ access Private

router.put('/experience',[
    [
      check('title', 'Title is required').not().isEmpty(),
      check('company', 'Company is required').not().isEmpty(),
      check('from', 'from date is required').not().isEmpty()
    ]
], auth, async (req, res) => {
      const errors = validationResult(req);
      if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
      } = req.body

      const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
      }

      try{
          const profile = await Profile.findOne({ user: req.user.id});

          profile.experience.unshift(newExp);

          await profile.save();

          res.json(profile);
      } catch(err){
          console.error(err.message);
          res.status(500).send('Server Error');
      }
})


// @ route  Delete api/profile/experience/:exp_id
// @ desc   Delete experience
// @ access Private

router.delete('/experience/:exp_id', auth, async (req, res) => {
      try{
          const profile = await Profile.findOne({user: req.user.id});

          //Get remove index

          const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

          profile.experience.splice(removeIndex, 1);

          await profile.save();
          
          res.json(profile);
      }catch(error) {
        console.error = (err.message);
        res.status(500).send('Server Error');
      }
});







// @ route  PUT api/profile/education
// @ desc   add profile education
// @ access Private

router.put('/education',[
  [
    check('school', 'School is required').not().isEmpty(),
    check('degree', 'Degree is required').not().isEmpty(),
    check('fieldofstudy', 'Field of Study is required').not().isEmpty(),
    check('from', 'from date is required').not().isEmpty()
  ]
], auth, async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    } = req.body

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    }

    try{
        const profile = await Profile.findOne({ user: req.user.id});

        profile.education.unshift(newEdu);

        await profile.save();

        res.json(profile);
    } catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @ route  Delete api/profile/experience/:exp_id
// @ desc   Delete experience
// @ access Private

router.delete('/education/:edu_id', auth, async (req, res) => {
  try{
      const profile = await Profile.findOne({user: req.user.id});

      //Get remove index

      const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);

      profile.education.splice(removeIndex, 1);

      await profile.save();
      
      res.json(profile);
  }catch(error) {
    console.error = (err.message);
    res.status(500).send('Server Error');
  }
});

// @ route  get api/profile/github/:username
// @ desc   Get user repo from Github
// @ access Public

router.get('/github/:username', (req, res) => {
  try {
      const options = {
        uri: `https://api.github.com/users/${
          req.params.username
        }/repos?client_id=${config.get(
          'githubClientId'
          )}$client_secret=${config.get('githubSecret')}`,
        method: 'GET',
        headers: { 'user-agent': 'nodejs' }
            };

      request(options, (error, response, body) => {
        if(error) console.error(error);

        if(response.statusCode !== 200) {
          return  res.status(404).json({ msg: 'No Github Profile Found'});
        };       
        res.json(JSON.parse(body));
      });
  } catch (err) {
    console.error(err.message);
   res.status(500).send('Server Error');
  }
});




module.exports = router;
