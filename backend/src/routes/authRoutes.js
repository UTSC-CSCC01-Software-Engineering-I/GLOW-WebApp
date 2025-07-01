const express = require('express');
const { body } = require('express-validator');
const UserController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Validation rules for registration
const registerValidation = [
body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('firstName')
    .notEmpty()
    .trim()
    .withMessage('First name is required'),
  
  body('lastName')
    .notEmpty()
    .trim()
    .withMessage('Last name is required')
];

// Validation rules for login
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Validation rules for profile update
const updateProfileValidation = [
body('firstName')
    .optional()
    .notEmpty()
    .trim()
    .withMessage('First name cannot be empty'),
  
  body('lastName')
    .optional()
    .notEmpty()
    .trim()
    .withMessage('Last name cannot be empty')
];

// Routes (View layer in MVC - defines API endpoints)

// POST /api/auth/register - Register new user
router.post('/register', registerValidation, UserController.register);

// POST /api/auth/login - Login user
router.post('/login', loginValidation, UserController.login);

// GET /api/auth/profile - Get user profile (protected route)
router.get('/profile', authMiddleware, UserController.getProfile);

// PUT /api/auth/profile - Update user profile (protected route)
router.put('/profile', authMiddleware, updateProfileValidation, UserController.updateProfile);

// GET /api/auth/test - Test protected route
router.get('/test', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Protected route accessed successfully',
    userId: req.userId
  });
});

module.exports = router;
