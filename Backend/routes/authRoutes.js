const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateToken } = require('../Utils/jwtUtils');
const { loginLimiter } = require('../Utils/rateLimit');

const router = express.Router();

// Ensure JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  process.exit(1);
}

// Google OAuth Login/Register
router.post('/google', async (req, res) => {
  try {
    const { email, name, picture, sub: googleId } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({ message: 'Missing required fields: email or googleId' });
    }

    let user = await User.findOne({ $or: [{ email }, { googleId }] });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        user.picture = picture || user.picture;
        await user.save();
      }
    } else {
      user = new User({
        username: name || `user_${googleId.slice(0, 8)}`, // Fallback username
        email,
        googleId,
        picture: picture || null,
        authType: 'google',
      });
      await user.save();
    }

    const token = generateToken(user._id);
    if (!token) throw new Error('Token generation failed');

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      user: { id: user._id, username: user.username, email: user.email, picture: user.picture },
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during Google authentication' });
  }
});

// Register User
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ username, email, password: hashedPassword, authType: 'local' });

    await user.save();

    const token = generateToken(user._id);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ 
      user: { id: user._id, username: user.username, email: user.email },
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login User with Rate Limit
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Missing email or password' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    if (user.authType === 'google') {
      return res.status(400).json({ message: 'Use Google Sign-In instead' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken(user._id);
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ 
      user: { id: user._id, username: user.username, email: user.email, picture: user.picture },
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Logout User
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;