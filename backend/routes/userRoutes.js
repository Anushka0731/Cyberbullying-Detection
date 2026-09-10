const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// FOLLOW A USER
router.post('/:id/follow', auth, async (req, res) => {
  try {
    const targetId = req.params.id;

    if (targetId === req.userId) {
      return res.status(400).json({ error: "You can't follow yourself" });
    }

    const currentUser = await User.findById(req.userId);
    const targetUser = await User.findById(targetId);

    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    const alreadyFollowing = currentUser.following.includes(targetId);

    if (alreadyFollowing) {
      currentUser.following = currentUser.following.filter((id) => id.toString() !== targetId);
      targetUser.followers = targetUser.followers.filter((id) => id.toString() !== req.userId);
    } else {
      currentUser.following.push(targetId);
      targetUser.followers.push(req.userId);
    }

    await currentUser.save();
    await targetUser.save();

    res.json({ following: !alreadyFollowing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET USER PROFILE
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;