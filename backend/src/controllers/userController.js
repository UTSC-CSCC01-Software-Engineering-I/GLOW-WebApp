const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// User Controller (Controller in MVC)
class UserController {
  // Register new user
  static async register(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg).join('; '); // Combine error messages
        return res.status(400).json({
          success: false,
          message: `Validation failed: ${errorMessages}`,
          errors: errors.array()
        });
      }

      const { username, email, password, firstName, lastName } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }]
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email or username already exists'
        });
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create new user
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName
      });

      await newUser.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: newUser._id, email: newUser.email },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '24h' }
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName
          },
          token
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during registration'
      });
    }
  }

  // Login user
  static async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg).join('; '); // Combine error messages
        return res.status(400).json({
          success: false,
          message: `Validation failed: ${errorMessages}`,
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
          },
          token
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during login'
      });
    }
  }

  // Get user profile
  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.userId).select('-password');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: { user }
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Update user profile
  static async updateProfile(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { firstName, lastName, username } = req.body;
      
      const user = await User.findByIdAndUpdate(
        req.userId,
        { firstName, lastName, username },
        { new: true, select: '-password' }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user }
      });

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = UserController;
