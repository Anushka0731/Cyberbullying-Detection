const express = require('express');
console.log('🔥🔥🔥 LOADED postRoutes.js 🔥🔥🔥');

const axios = require('axios');

const Post = require('../models/Post');
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');

const router = express.Router();

const ML_API_URL =
  process.env.ML_API_URL || 'http://localhost:8000/api/predict';


// =====================================================
// CREATE POST
// =====================================================

router.post('/', auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        error: 'Post cannot be empty',
      });
    }

    const trimmedText = text.trim();

    let flagged = false;
    let category = 'not_cyberbullying';
    let bullyingProbability = 0;

    try {
      const mlResponse = await axios.post(
        ML_API_URL,
        {
          text: trimmedText,
        }
      );

      console.log('🔥 POST ML RESULT:', mlResponse.data);

      flagged = Boolean(
        mlResponse.data.is_bullying
      );

      category =
        mlResponse.data.category ||
        'not_cyberbullying';

      bullyingProbability =
        Number(
          mlResponse.data.bullying_probability
        ) || 0;

    } catch (mlErr) {
      console.error(
        '🔥 POST ML ERROR:',
        mlErr.response?.data || mlErr.message
      );

      return res.status(503).json({
        error:
          'ML service unavailable. Post was not checked.',
      });
    }

    const post = await Post.create({
      user: req.userId,
      text: trimmedText,
      flagged,
      category,
      bullyingProbability,
    });

    await post.populate(
      'user',
      'name handle initials'
    );

    res.status(201).json(post);

  } catch (err) {
    console.error('🔥 POST ERROR:', err);

    res.status(500).json({
      error: err.message,
    });
  }
});


// =====================================================
// GET ALL POSTS
// =====================================================

router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate(
        'user',
        'name handle initials'
      )
      .sort({
        createdAt: -1,
      });

    res.json(posts);

  } catch (err) {
    console.error(
      '🔥 GET POSTS ERROR:',
      err
    );

    res.status(500).json({
      error: err.message,
    });
  }
});


// =====================================================
// GET MY POST HISTORY
// ONLY POSTS BELONGING TO LOGGED-IN USER
// =====================================================

router.get('/history', auth, async (req, res) => {
  try {
    const posts = await Post.find({
      user: req.userId,
    })
      .populate(
        'user',
        'name handle initials'
      )
      .sort({
        createdAt: -1,
      });

    console.log(
      '📜 HISTORY FOR USER:',
      req.userId
    );

    console.log(
      '📜 HISTORY POSTS FOUND:',
      posts.length
    );

    res.json(posts);

  } catch (err) {
    console.error(
      '🔥 HISTORY ERROR:',
      err
    );

    res.status(500).json({
      error: err.message,
    });
  }
});


// =====================================================
// LIKE POST
// =====================================================

router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(
      req.params.id
    );

    if (!post) {
      return res.status(404).json({
        error: 'Post not found',
      });
    }

    post.likes = post.likes + 1;

    await post.save();

    res.json(post);

  } catch (err) {
    console.error(
      '🔥 LIKE ERROR:',
      err
    );

    res.status(500).json({
      error: err.message,
    });
  }
});


// =====================================================
// ADD COMMENT
// COMMENT IS CHECKED BY SAME ML MODEL AS POSTS
// =====================================================

router.post('/:id/comment', auth, async (req, res) => {

  console.log('');
  console.log('======================================');
  console.log('🔥🔥🔥 COMMENT ROUTE HIT 🔥🔥🔥');
  console.log('======================================');

  try {

    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        error: 'Comment cannot be empty',
      });
    }

    const trimmedText = text.trim();

    console.log(
      '🔥 COMMENT TEXT:',
      trimmedText
    );

    console.log(
      '🔥 ML API URL:',
      ML_API_URL
    );


    // =================================================
    // SEND COMMENT TO SAME ML API AS POSTS
    // =================================================

    let mlResponse;

    try {

      mlResponse = await axios.post(
        ML_API_URL,
        {
          text: trimmedText,
        }
      );

      console.log(
        '🔥🔥🔥 COMMENT ML RESPONSE:',
        mlResponse.data
      );

    } catch (mlErr) {

      console.error(
        '🔥 COMMENT ML ERROR:',
        mlErr.response?.data ||
        mlErr.message
      );

      return res.status(503).json({
        error:
          'ML service unavailable. Comment was not checked.',
      });
    }


    // =================================================
    // GET ML VALUES
    // =================================================

    const flagged = Boolean(
      mlResponse.data.is_bullying
    );

    const category =
      mlResponse.data.category ||
      'not_cyberbullying';

    const bullyingProbability =
      Number(
        mlResponse.data.bullying_probability
      ) || 0;

    const categoryConfidence =
      Number(
        mlResponse.data.category_confidence
      ) || 0;


    console.log(
      '🔥 COMMENT FLAGGED:',
      flagged
    );

    console.log(
      '🔥 COMMENT CATEGORY:',
      category
    );

    console.log(
      '🔥 COMMENT BULLYING PROBABILITY:',
      bullyingProbability
    );

    console.log(
      '🔥 COMMENT CATEGORY CONFIDENCE:',
      categoryConfidence
    );


    // =================================================
    // SAVE COMMENT
    // =================================================

    const comment = await Comment.create({
      post: req.params.id,
      user: req.userId,
      text: trimmedText,

      flagged: flagged,
      category: category,
      bullyingProbability: bullyingProbability,
      categoryConfidence: categoryConfidence,
    });


    // =================================================
    // GET USER INFORMATION
    // =================================================

    await comment.populate(
      'user',
      'name handle initials'
    );


    // =================================================
    // RETURN ML DATA DIRECTLY
    // =================================================

    const response = {
      _id: comment._id,
      post: comment.post,
      user: comment.user,
      text: comment.text,

      flagged: flagged,

      category: category,

      bullyingProbability:
        bullyingProbability,

      categoryConfidence:
        categoryConfidence,

      createdAt: comment.createdAt,
    };


    console.log(
      '🔥🔥🔥 FINAL COMMENT RESPONSE:',
      response
    );

    console.log(
      '======================================'
    );


    res.status(201).json(response);

  } catch (err) {

    console.error(
      '🔥🔥🔥 COMMENT ERROR:',
      err
    );

    res.status(500).json({
      error: err.message,
    });
  }
});


// =====================================================
// GET COMMENTS FOR POST
// =====================================================

router.get('/:id/comments', auth, async (req, res) => {

  try {

    const comments = await Comment.find({
      post: req.params.id,
    })
      .populate(
        'user',
        'name handle initials'
      )
      .sort({
        createdAt: 1,
      });

    res.json(comments);

  } catch (err) {

    console.error(
      '🔥 GET COMMENTS ERROR:',
      err
    );

    res.status(500).json({
      error: err.message,
    });
  }
});


module.exports = router;