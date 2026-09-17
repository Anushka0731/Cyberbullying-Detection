const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');

const router = express.Router();


// =========================
// RATE LIMITER
// =========================

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    error: 'Too many attempts, please try again later.',
  },
});


// =========================
// EMAIL TRANSPORTER
// =========================

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});


// =========================
// REGISTER
// =========================

router.post(
  '/register',
  authLimiter,
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required'),

    body('handle')
      .trim()
      .notEmpty()
      .withMessage('Username is required'),

    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address')
      .normalizeEmail(),

    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
  ],

  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.array()[0].msg,
      });
    }

    try {
      const {
        name,
        handle,
        email,
        password,
      } = req.body;


      // =========================
      // CHECK EXISTING EMAIL
      // =========================

      const existingByEmail = await User.findOne({ email });

      if (existingByEmail) {

        // -------------------------
        // EMAIL ALREADY VERIFIED
        // -------------------------

        if (existingByEmail.isEmailVerified === true) {
          return res.status(400).json({
            error:
              'This email is already in use. Please log in instead.',
          });
        }


        // -------------------------
        // EMAIL EXISTS BUT
        // IS NOT VERIFIED
        // -------------------------

        const verificationToken =
          crypto.randomBytes(32).toString('hex');

        const hashedVerificationToken =
          crypto
            .createHash('sha256')
            .update(verificationToken)
            .digest('hex');

        existingByEmail.emailVerificationToken =
          hashedVerificationToken;

        existingByEmail.emailVerificationExpires =
          new Date(Date.now() + 60 * 60 * 1000);

        await existingByEmail.save();


        const verificationLink =
          `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;


        try {
          await transporter.sendMail({
            from: `"Unsaid" <${process.env.EMAIL_USER}>`,
            to: existingByEmail.email,
            subject: 'Verify your Unsaid account',

            html: `
              <div
                style="
                  font-family: Arial, sans-serif;
                  max-width: 600px;
                  margin: auto;
                  padding: 20px;
                "
              >

                <h2>Verify your Unsaid account</h2>

                <p>
                  Hi ${existingByEmail.name},
                </p>

                <p>
                  An Unsaid account already exists with this email,
                  but the email address has not been verified yet.
                </p>

                <p>
                  Click the button below to verify your email:
                </p>

                <p style="margin: 30px 0;">

                  <a
                    href="${verificationLink}"
                    style="
                      background: #82418C;
                      color: white;
                      padding: 12px 24px;
                      text-decoration: none;
                      border-radius: 6px;
                      display: inline-block;
                    "
                  >
                    Verify My Email
                  </a>

                </p>

                <p>
                  This link will expire in 1 hour.
                </p>

              </div>
            `,
          });

          return res.status(201).json({
            message:
              'This account already exists but has not been verified. A new verification email has been sent.',
          });

        } catch (emailError) {

          console.error(
            'Verification email error:',
            emailError
          );

          return res.status(500).json({
            error:
              'We could not send the verification email. Please try again.',
          });
        }
      }


      // =========================
      // CHECK EXISTING USERNAME
      // =========================

      const existingByHandle =
        await User.findOne({ handle });

      if (existingByHandle) {
        return res.status(400).json({
          error:
            'This username is already in use. Please choose another username.',
        });
      }


      // =========================
      // HASH PASSWORD
      // =========================

      const hashedPassword =
        await bcrypt.hash(password, 10);


      // =========================
      // CREATE INITIALS
      // =========================

      const initials =
        name
          .split(' ')
          .map((word) => word[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);


      // =========================
      // CREATE VERIFICATION TOKEN
      // =========================

      const verificationToken =
        crypto.randomBytes(32).toString('hex');

      const hashedVerificationToken =
        crypto
          .createHash('sha256')
          .update(verificationToken)
          .digest('hex');


      // =========================
      // CREATE USER
      // =========================

      const user = await User.create({
        name,
        handle,
        email,
        password: hashedPassword,
        initials,

        // User must verify email before login
        isEmailVerified: false,

        emailVerificationToken:
          hashedVerificationToken,

        emailVerificationExpires:
          new Date(Date.now() + 60 * 60 * 1000),
      });


      // =========================
      // VERIFICATION LINK
      // =========================

      const verificationLink =
        `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;


      // =========================
      // SEND VERIFICATION EMAIL
      // =========================

      try {
        await transporter.sendMail({
          from: `"Unsaid" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: 'Verify your Unsaid account',

          html: `
            <div
              style="
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: auto;
                padding: 20px;
              "
            >

              <h2>Welcome to Unsaid!</h2>

              <p>
                Hi ${name},
              </p>

              <p>
                Your Unsaid account has been created successfully.
              </p>

              <p>
                Please verify your email address
                by clicking the button below.
              </p>

              <p style="margin: 30px 0;">

                <a
                  href="${verificationLink}"
                  style="
                    background: #82418C;
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 6px;
                    display: inline-block;
                  "
                >
                  Verify My Email
                </a>

              </p>

              <p>
                This verification link will expire in 1 hour.
              </p>

              <p>
                If you did not create this account,
                you can ignore this email.
              </p>

            </div>
          `,
        });

        return res.status(201).json({
          message:
            'Account created! Please check your email to verify your account.',
        });

      } catch (emailError) {

        console.error(
          'Verification email error:',
          emailError
        );

        // Remove account if verification email could not be sent
        try {
          await User.findByIdAndDelete(user._id);
        } catch (deleteError) {
          console.error(
            'Failed to remove incomplete account:',
            deleteError
          );
        }

        return res.status(500).json({
          error:
            'We could not send the verification email. Your account was not created. Please try again.',
        });
      }


    } catch (err) {

      console.error(
        'Registration error:',
        err
      );

      if (err.code === 11000) {

        return res.status(400).json({
          error:
            'This email or username is already in use.',
        });
      }

      return res.status(500).json({
        error:
          'Unable to create account. Please try again.',
      });
    }
  }
);


// =========================
// VERIFY EMAIL
// =========================

router.get(
  '/verify-email',
  async (req, res) => {

    try {

      const { token } = req.query;

      if (!token) {

        console.log(
          'VERIFY ERROR: No token received'
        );

        return res.status(400).json({
          error:
            'Verification token is missing',
        });
      }


      // =========================
      // HASH TOKEN
      // =========================

      const hashedToken =
        crypto
          .createHash('sha256')
          .update(token)
          .digest('hex');


      // =========================
      // FIND USER
      // =========================

      const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: {
          $gt: new Date(),
        },
      });


      if (!user) {

        console.log(
          'VERIFY ERROR: Token invalid or expired'
        );

        return res.status(400).json({
          error:
            'Verification link is invalid or has expired',
        });
      }


      // =========================
      // VERIFY USER
      // =========================

      console.log(
        'VERIFYING EMAIL FOR:',
        user.email
      );

      console.log(
        'BEFORE:',
        user.isEmailVerified
      );


      user.isEmailVerified = true;

      // Token can NEVER be reused
      user.emailVerificationToken = null;

      user.emailVerificationExpires = null;


      await user.save();


      // =========================
      // CONFIRM DATABASE UPDATE
      // =========================

      const updatedUser =
        await User.findById(user._id);


      console.log(
        'AFTER:',
        updatedUser.isEmailVerified
      );


      return res.json({
        message:
          'Email verified successfully! You can now log in.',
      });


    } catch (err) {

      console.error(
        'Email verification error:',
        err
      );

      return res.status(500).json({
        error:
          'Unable to verify email',
      });
    }
  }
);


// =========================
// LOGIN
// =========================

router.post(
  '/login',
  authLimiter,

  [
    body('email')
      .isEmail()
      .withMessage(
        'Please enter a valid email address'
      )
      .normalizeEmail(),

    body('password')
      .notEmpty()
      .withMessage(
        'Password is required'
      ),
  ],

  async (req, res) => {

    const errors =
      validationResult(req);

    if (!errors.isEmpty()) {

      return res.status(400).json({
        error:
          errors.array()[0].msg,
      });
    }


    try {

      const {
        email,
        password,
      } = req.body;


      // =========================
      // FIND USER
      // =========================

      const user =
        await User.findOne({ email });


      // =========================
      // ACCOUNT DOES NOT EXIST
      // =========================

      if (!user) {

        return res.status(404).json({
          error:
            'Account does not exist. Please sign up first.',
        });
      }


      // =========================
      // CHECK PASSWORD
      // =========================

      const isMatch =
        await bcrypt.compare(
          password,
          user.password
        );


      if (!isMatch) {

        return res.status(400).json({
          error:
            'Incorrect password. Please try again.',
        });
      }


      // =========================
      // CHECK EMAIL VERIFICATION
      // =========================

      console.log('LOGIN CHECK:', {
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      });


      if (user.isEmailVerified !== true) {

        return res.status(403).json({
          error:
            'Please verify your email before logging in.',
        });
      }


      // =========================
      // CREATE JWT
      // =========================

      const token =
        jwt.sign(
          {
            userId: user._id,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: '7d',
          }
        );


      // =========================
      // LOGIN SUCCESS
      // =========================

      return res.json({

        token,

        user: {
          id: user._id,
          name: user.name,
          handle: user.handle,
          initials: user.initials,
        },

      });


    } catch (err) {

      console.error(
        'Login error:',
        err
      );

      return res.status(500).json({
        error:
          'Unable to log in. Please try again.',
      });
    }
  }
);


// =========================
// GET CURRENT USER
// =========================

router.get(
  '/me',
  async (req, res) => {

    try {

      const authHeader =
        req.headers.authorization;


      if (!authHeader) {

        return res.status(401).json({
          error:
            'No token provided',
        });
      }


      const token =
        authHeader.split(' ')[1];


      const decoded =
        jwt.verify(
          token,
          process.env.JWT_SECRET
        );


      const user =
        await User.findById(
          decoded.userId
        ).select('-password');


      if (!user) {

        return res.status(404).json({
          error:
            'User not found',
        });
      }


      return res.json({
        user,
      });


    } catch (err) {

      return res.status(401).json({
        error:
          'Invalid or expired token',
      });
    }
  }
);


module.exports = router;