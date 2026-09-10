const express = require('express');
const axios = require('axios');
const Post = require('../models/Post');
const auth = require('../middleware/auth');

const router = express.Router();

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000/api/predict';

// CREATE POST
router.post('/', auth, async (req, res) => {
  try {
    const { text } = req.body;

    let flagged = false;
    let category = 'not_cyberbullying';
    let bullyingProbability = 0;

    try {
      const mlResponse = await axios.post(ML_API_URL, { text });
      flagged = mlResponse.data.is_bullying;
      category = mlResponse.data.category;
      bullyingProbability = mlResponse.data.bullying_probability;
    } catch (mlErr) {
      console.log('ML API call failed, saving post unflagged:', mlErr.message);
    }

    const post = await Post.create({
      user: req.userId,
      text,
      flagged,
      category,
      bullyingProbability,
    });

    const populatedPost = await post.populate('user', 'name handle initials');

    res.status(201).json(populatedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL POSTS (feed)
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'name handle initials')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const Comment = require('../models/Comment');
const User = require('../models/User');

// LIKE / UNLIKE A POST
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    post.likes = post.likes + 1;
    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD COMMENT
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;

    const comment = await Comment.create({
      post: req.params.id,
      user: req.userId,
      text,
    });

    const populatedComment = await comment.populate('user', 'name handle initials');

    res.status(201).json(populatedComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET COMMENTS FOR A POST
router.get('/:id/comments', auth, async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate('user', 'name handle initials')
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;