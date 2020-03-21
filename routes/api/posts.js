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

// @ route  PUT api/Posts/like/:id
// @ desc   like a Post
// @ access private

router.put('/like/:id', auth, async (req, res) => {
      try {
          const post = await Post.findById(req.params.id);

          // Check if the post has already like
          if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
                return res.status(400).json( {msg: 'Post Already Like' });
          }

          post.likes.unshift({ user: req.user.id });

          await post.save();
          res.json(post.likes);

      } catch(err) {
          console.error(err.message); 
          res.status(500).send('Server Error'); 
      }
});

// @ route  PUT api/Posts/unlike/:id
// @ desc   like a Post
// @ access private

router.put('/unlike/:id', auth, async (req, res) => {
  try {
      const post = await Post.findById(req.params.id);

      // Check if the post has already like
      if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json( {msg: 'Post has not yet been Liked' });
      }

      // Get remove index 

      const removeIndex = post.likes
      .map(like => like.user.toString())
      .indexOf(req.user.id);

      post.likes.splice(removeIndex, 1);

      await post.save();
      res.json(post.likes);

  } catch(err) {
      console.error(err.message); 
      res.status(500).send('Server Error'); 
  }
});

// @ route  Post api/Posts/comment/:id
// @ desc   comment on a post
// @ access private

router.post("/comment/:id", [auth, [
  check('text', 'Text Is Required').not().isEmpty()
]], async (req, res) => {
      const errors =  validationResult(req);

      if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try{
        const user =  await User.findById(req.user.id).select('-password');
        const post =  await Post.findById(req.params.id);

        const newComment = {
          text: req.body.text,
          name: user.name,
          avatar: user.avatar,
          user: req.user.id
        };

        post.comments.unshift(newComment);

        await post.save();

        res.json(post.comments);

      } catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
      }
});

// @ route  Post api/Posts/comment/:id/:comment_id
// @ desc   Delete Comment Post
// @ access private

router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
  try{
    const post =  await Post.findById(req.params.id);

    // pull out comments

    const comment = post.comments.find(comment => comment.id === req.params.comment_id);

    // make sure comments exists
    if(!comment) {
      return res.status(404).json({ msg: 'Comment does not exist' });
    }

    // check user 

    if(comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized'});
    }

    // Get remove index 

    const removeIndex = post.comments
    .map(comment => comment.user.toString())
    .indexOf(req.user.id);

    post.comments.splice(removeIndex, 1);

    await post.save();

    res.json(post.comments);

  } catch(err){
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;