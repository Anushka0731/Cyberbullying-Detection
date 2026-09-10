const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
    },

    // ============================
    // CYBERBULLYING ML RESULT
    // ============================

    flagged: {
      type: Boolean,
      default: false,
    },

    category: {
      type: String,
      default: 'not_cyberbullying',
    },

    bullyingProbability: {
      type: Number,
      default: 0,
    },

    categoryConfidence: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Comment', commentSchema);