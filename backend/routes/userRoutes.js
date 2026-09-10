const express = require('express');

const User = require('../models/User');
const Post = require('../models/Post');

const auth = require('../middleware/auth');

const router = express.Router();


/* =====================================================
   SEARCH USERS
===================================================== */

router.get(
  '/search',
  auth,
  async (req, res) => {

    try {

      const query =
        (req.query.q || '').trim();


      const filter = query
        ? {
            $or: [
              {
                name: {
                  $regex: query,
                  $options: 'i',
                },
              },

              {
                handle: {
                  $regex: query,
                  $options: 'i',
                },
              },
            ],
          }
        : {};


      const users =
        await User.find(filter)
          .select(
            'name handle initials bio'
          )
          .sort({
            name: 1,
          });


      console.log(
        '🔎 SEARCH:',
        query
      );

      console.log(
        '👤 USERS FOUND:',
        users.length
      );


      res.json(users);

    } catch (err) {

      console.error(
        '❌ SEARCH USERS ERROR:',
        err
      );

      res.status(500).json({
        error: err.message,
      });

    }

  }
);


/* =====================================================
   FOLLOW USER
===================================================== */

router.post(
  '/:id/follow',
  auth,
  async (req, res) => {

    try {

      const targetId =
        req.params.id;


      if (targetId === req.userId) {

        return res.status(400).json({
          error:
            "You can't follow yourself",
        });

      }


      const currentUser =
        await User.findById(
          req.userId
        );

      const targetUser =
        await User.findById(
          targetId
        );


      if (!targetUser) {

        return res.status(404).json({
          error:
            'User not found',
        });

      }


      const alreadyFollowing =
        currentUser.following.includes(
          targetId
        );


      if (alreadyFollowing) {

        currentUser.following =
          currentUser.following.filter(
            (id) =>
              id.toString() !==
              targetId
          );


        targetUser.followers =
          targetUser.followers.filter(
            (id) =>
              id.toString() !==
              req.userId
          );

      } else {

        currentUser.following.push(
          targetId
        );

        targetUser.followers.push(
          req.userId
        );

      }


      await currentUser.save();
      await targetUser.save();


      res.json({
        following:
          !alreadyFollowing,
      });

    } catch (err) {

      console.error(
        'FOLLOW ERROR:',
        err
      );

      res.status(500).json({
        error: err.message,
      });

    }

  }
);


/* =====================================================
   GET USER PROFILE
===================================================== */

router.get(
  '/:id',
  auth,
  async (req, res) => {

    try {

      const user =
        await User.findById(
          req.params.id
        ).select('-password');


      if (!user) {

        return res.status(404).json({
          error:
            'User not found',
        });

      }


      res.json(user);

    } catch (err) {

      console.error(
        'GET USER ERROR:',
        err
      );

      res.status(500).json({
        error: err.message,
      });

    }

  }
);


/* =====================================================
   GET ALL POSTS BY USER
===================================================== */

router.get(
  '/:id/posts',
  auth,
  async (req, res) => {

    try {

      const posts =
        await Post.find({
          user: req.params.id,
        })

          .populate(
            'user',
            'name handle initials'
          )

          .sort({
            createdAt: -1,
          });


      console.log(
        '👤 PROFILE POSTS:',
        req.params.id,
        posts.length
      );


      res.json(posts);

    } catch (err) {

      console.error(
        'GET USER POSTS ERROR:',
        err
      );

      res.status(500).json({
        error: err.message,
      });

    }

  }
);


module.exports = router;