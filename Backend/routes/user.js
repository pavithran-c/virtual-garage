const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

// GET /api/user/me - Fetch authenticated user's profile
router.get("/me", authMiddleware, async (req, res) => {
  try {
    // req.user.id comes from authMiddleware (decoded JWT)
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log(user.createdAt);
    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        picture: user.picture,
        authType: user.authType,
        createdAt: user.createdAt || new Date(), // Fallback to current date if missing
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error.message, error.stack);
    res.status(500).json({ message: "Server error while fetching profile" });
  }
});

// PUT /api/user/me - Update authenticated user's profile
router.put("/me", authMiddleware, async (req, res) => {
  const { username, email } = req.body;

  // Validate input
  if (!username || !email) {
    return res.status(400).json({ message: "Username and email are required" });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check for email uniqueness (excluding current user)
    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    // Update fields
    user.username = username.trim();
    user.email = email.trim().toLowerCase();
    await user.save();

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        picture: user.picture || null,
        authType: user.authType,
        createdAt: user.createdAt || new Date(),
      },
    });
  } catch (error) {
    console.error("Error updating user profile:", error.message, error.stack);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already in use" });
    }
    res.status(500).json({ message: "Server error while updating profile" });
  }
});

module.exports = router;