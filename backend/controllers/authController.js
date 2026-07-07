const User = require('../models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const mockDb = require('../config/mockDb');

// Helper to generate JWT token and set HTTP-only cookie
const sendTokenResponse = (user, statusCode, res) => {
  // Handle difference in id field (mock has _id or id)
  const userId = user._id || user.id;

  // Create token
  const token = jwt.sign(
    { id: userId, email: user.email, name: user.name },
    process.env.JWT_SECRET || 'super_secret_key_for_finance_tracker_123_development_mode',
    { expiresIn: '30d' }
  );

  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true, // XSS protection
    sameSite: 'lax', // CSRF mitigation
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  res.status(statusCode).cookie('token', token, cookieOptions).json({
    success: true,
    user: {
      id: userId,
      name: user.name,
      email: user.email,
    },
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    // Dynamic Fallback check
    if (mongoose.connection.readyState !== 1) {
      const userExists = await mockDb.users.findByEmail(email);
      if (userExists) {
        return res.status(400).json({
          success: false,
          message: 'A user with this email address already exists.',
        });
      }
      const user = await mockDb.users.create({ name, email, password });
      return sendTokenResponse(user, 201, res);
    }

    // Standard MongoDB path
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    const user = await User.create({ name, email, password });
    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Log user in
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Dynamic Fallback check
    if (mongoose.connection.readyState !== 1) {
      const user = await mockDb.users.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials. Please try again.',
        });
      }
      const bcrypt = require('bcryptjs');
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials. Please try again.',
        });
      }
      return sendTokenResponse(user, 200, res);
    }

    // Standard MongoDB path
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please try again.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please try again.',
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    // Dynamic Fallback check
    if (mongoose.connection.readyState !== 1) {
      const user = await mockDb.users.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User profile not found.',
        });
      }
      return res.status(200).json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    }

    // Standard MongoDB path
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};
