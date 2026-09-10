const express = require('express');
const router = express.Router();
const {
  getAllPosts,
  createPost,
  upvotePost,
  addReply
} = require('../controllers/communityController');

router.get('/posts', getAllPosts);
router.post('/posts', createPost);
router.post('/posts/:id/upvote', upvotePost);
router.post('/posts/:id/reply', addReply);

module.exports = router;
