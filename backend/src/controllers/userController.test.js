// __tests__/userController.test.js
const UserController = require('../controllers/userController');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

jest.mock('../models/User');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('express-validator');

describe('UserController', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, userId: 'user123' };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  // ------------------- REGISTER -------------------
  describe('register', () => {
    it('returns 400 if validation errors exist', async () => {
      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Email required' }]
      });

      await UserController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.stringContaining('Validation failed: Email required'),
        errors: expect.any(Array)
      });
    });

    it('returns 409 if user already exists', async () => {
      validationResult.mockReturnValue({ isEmpty: () => true });
      req.body = { email: 'test@test.com', password: '123', firstName: 'A', lastName: 'B' };
      User.findOne.mockResolvedValue({ email: 'test@test.com' });

      await UserController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User with this email already exists'
      });
    });

    it('registers user and returns 201', async () => {
      validationResult.mockReturnValue({ isEmpty: () => true });
      req.body = { email: 'test@test.com', password: '123', firstName: 'A', lastName: 'B' };

      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedPassword');
      const fakeUser = {
        _id: 'u1',
        email: 'test@test.com',
        firstName: 'A',
        lastName: 'B',
        save: jest.fn().mockResolvedValue(true)
      };
      User.mockImplementation(() => fakeUser);
      jwt.sign.mockReturnValue('jwt-token-123');

      await UserController.register(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith('123', 12);
      expect(fakeUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: 'u1',
            email: 'test@test.com',
            firstName: 'A',
            lastName: 'B'
          },
          token: 'jwt-token-123'
        }
      });
    });

    it('returns 500 on unexpected error', async () => {
      validationResult.mockReturnValue({ isEmpty: () => true });
      req.body = { email: 'test@test.com', password: '123', firstName: 'A', lastName: 'B' };
      User.findOne.mockRejectedValue(new Error('DB down'));

      await UserController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error during registration'
      });
    });
  });

  // ------------------- LOGIN -------------------
  describe('login', () => {
    it('returns 400 if validation fails', async () => {
      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid input' }]
      });

      await UserController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.stringContaining('Validation failed: Invalid input'),
        errors: expect.any(Array)
      });
    });

    it('returns 401 if user not found', async () => {
      validationResult.mockReturnValue({ isEmpty: () => true });
      req.body = { email: 'a@b.com', password: 'pw' };
      User.findOne.mockResolvedValue(null);

      await UserController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid credentials'
      });
    });

    it('returns 401 if password mismatch', async () => {
      validationResult.mockReturnValue({ isEmpty: () => true });
      req.body = { email: 'a@b.com', password: 'wrong' };
      User.findOne.mockResolvedValue({ password: 'hashed' });
      bcrypt.compare.mockResolvedValue(false);

      await UserController.login(req, res);

      expect(bcrypt.compare).toHaveBeenCalledWith('wrong', 'hashed');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid credentials'
      });
    });

    it('returns token on successful login', async () => {
      validationResult.mockReturnValue({ isEmpty: () => true });
      req.body = { email: 'a@b.com', password: 'right' };
      const userDoc = { _id: 'u2', email: 'a@b.com', firstName: 'F', lastName: 'L', password: 'hashed' };
      User.findOne.mockResolvedValue(userDoc);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('jwt-tkn');

      await UserController.login(req, res);

      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: 'u2', email: 'a@b.com' },
        expect.any(String),
        { expiresIn: '24h' }
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: 'u2',
            email: 'a@b.com',
            firstName: 'F',
            lastName: 'L'
          },
          token: 'jwt-tkn'
        }
      });
    });

    it('returns 500 on unexpected error', async () => {
      validationResult.mockReturnValue({ isEmpty: () => true });
      User.findOne.mockRejectedValue(new Error('DB down'));

      await UserController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error during login'
      });
    });
  });

  // ------------------- GET PROFILE -------------------
  describe('getProfile', () => {
    it('returns 404 if user not found', async () => {
      // Stub chain: User.findById(...).select(...) → null
      const selectMock = jest.fn().mockResolvedValue(null);
      User.findById.mockReturnValue({ select: selectMock });

      await UserController.getProfile(req, res);

      expect(selectMock).toHaveBeenCalledWith('-password');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found'
      });
    });

    it('returns profile if user found', async () => {
      const fakeUser = { _id: 'u3', email: 'c@d.com', firstName: 'X', lastName: 'Y' };
      const selectMock = jest.fn().mockResolvedValue(fakeUser);
      User.findById.mockReturnValue({ select: selectMock });

      await UserController.getProfile(req, res);

      expect(selectMock).toHaveBeenCalledWith('-password');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { user: fakeUser }
      });
    });

    it('returns 500 on DB error', async () => {
      const selectMock = jest.fn().mockRejectedValue(new Error('boom'));
      User.findById.mockReturnValue({ select: selectMock });

      await UserController.getProfile(req, res);

      expect(selectMock).toHaveBeenCalledWith('-password');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error'
      });
    });
  });

  // ------------------- UPDATE PROFILE -------------------
  describe('updateProfile', () => {
    it('returns 400 on validation errors', async () => {
      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid name' }]
      });

      await UserController.updateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        errors: expect.any(Array)
      });
    });

    it('returns 404 if user not found', async () => {
      validationResult.mockReturnValue({ isEmpty: () => true });
      req.body = { firstName: 'New', lastName: 'Name' };
      User.findByIdAndUpdate.mockResolvedValue(null);

      await UserController.updateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found'
      });
    });

    it('updates and returns user', async () => {
      validationResult.mockReturnValue({ isEmpty: () => true });
      req.body = { firstName: 'New', lastName: 'Name' };
      const updatedUser = { _id: 'u4', email: 'e@f.com', firstName: 'New', lastName: 'Name' };
      User.findByIdAndUpdate.mockResolvedValue(updatedUser);

      await UserController.updateProfile(req, res);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        { firstName: 'New', lastName: 'Name' },
        { new: true, select: '-password' }
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Profile updated successfully',
        data: { user: updatedUser }
      });
    });

    it('returns 500 on DB error', async () => {
      validationResult.mockReturnValue({ isEmpty: () => true });
      User.findByIdAndUpdate.mockRejectedValue(new Error('fail'));

      await UserController.updateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error'
      });
    });
  });
});