// Frontend User Controller (Client-side business logic)
// This handles client-side user operations and API interactions

import { authAPI } from '../src/lib/api';

export class ClientUserController {
  // Handle user registration from frontend
  static async registerUser(userData) {
    try {
      const response = await authAPI.register(userData);
      return {
        success: true,
        user: response.data.user,
        token: response.data.token,
        message: 'Registration successful!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Registration failed'
      };
    }
  }

  // Handle user login from frontend
  static async loginUser(credentials) {
    try {
      const response = await authAPI.login(credentials);
      return {
        success: true,
        user: response.data.user,
        token: response.data.token,
        message: 'Login successful!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Login failed'
      };
    }
  }

  // Handle user logout
  static logoutUser() {
    authAPI.logout();
    return {
      success: true,
      message: 'Logged out successfully'
    };
  }

  // Get current user profile
  static async getUserProfile() {
    try {
      const response = await authAPI.getProfile();
      return {
        success: true,
        user: response.data.user
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to get profile'
      };
    }
  }

  // Update user profile
  static async updateUserProfile(profileData) {
    try {
      const response = await authAPI.updateProfile(profileData);
      return {
        success: true,
        user: response.data.user,
        message: 'Profile updated successfully!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to update profile'
      };
    }
  }

  // Check if user is authenticated
  static isUserAuthenticated() {
    return authAPI.isAuthenticated();
  }

  // Test backend connectivity
  static async testBackendConnection() {
    try {
      const response = await authAPI.testProtected();
      return {
        success: true,
        message: response.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Backend connection failed'
      };
    }
  }
}

export default ClientUserController;