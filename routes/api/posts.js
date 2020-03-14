const express = require("express");
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @ route  Post api/Posts
// @ desc   Test route
// @ access private

router.post("/", [auth, [
      check('text', 'Text Is Required').not().isEmpty()
]], async (req, res) => {
          const errors =  validationResult(req);

          if(!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
          }

          try{
            const user =  await User.findById(req.user.id).select('-password');

            const newPost = new Post({
              text: req.body.text,
              name: user.name,
              avatar: user.avatar,
              user: req.user.id
            });

            const post = await newPost.save();

            res.json(post);

          } catch(err){
            console.error(err.message);
            res.status(500).send('Server Error');
          }
});

// @ route  Get api/Posts
// @ desc   Get all posts
// @ access private

router.get('/', auth, async (req, res) => {
    try{
        const posts = await Post.find().sort({ date: -1 });
        res.json(posts);

    } catch(err) {
      console.errror(err.message);
      res.status(500).send('Server Error');
    }
});

// @ route  Get api/Posts/:id
// @ desc   Get posts by id
// @ access private
router.get('/:id', auth, async (req, res) => {
  try{
      const post = await Post.findById(req.params.id);

      if(!post) {
        return res.status(404).json({ msg: 'Post Not Fount' })
      }
      res.json(post);

  } catch(err) {
    console.error(err.message);
    if(err.kind == 'objectId') {
      return res.status(404).json({ msg: 'Post Not Fount' })
    }
    res.status(500).send('Server Error');
  }
});


// @ route  Delete api/Posts/:id
// @ desc   Delete posts by id
// @ access private
router.delete('/:id', auth, async (req, res) => {
  try{
      const post = await Post.findById(req.params.id);

      if(!post) {
        return res.status(404).json({ msg: 'Post Not Fount' })
      }

      // Check user
      if(post.user.toString() !== req.user.id) {

        return res.status(401).json({ msg: 'User not authorized' })
      }
        await post.remove();

        res.json({ msg: 'Post removed'});
        
  } catch(err) {
    console.error(err.message);
    if(err.kind == 'objectId') {
      return res.status(404).json({ msg: 'Post Not Fount' })
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
