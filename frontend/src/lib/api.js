// API utility functions for connecting frontend to backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://glow-backend-v4-0-0.onrender.com/api';

// Generic API call function
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  // Add auth token if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
}

// Auth API functions
export const authAPI = {
  // Register new user
  register: async (userData) => {
    return apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Login user
  login: async (credentials) => {
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Store token in localStorage
    if (response.success && response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }

    return response;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('authToken');
  },

  // Get user profile
  getProfile: async () => {
    return apiCall('/auth/profile');
  },

  // Update user profile
  updateProfile: async (profileData) => {
    return apiCall('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Delete user account
  deleteAccount: async () => {
    const response = await apiCall('/auth/profile', {
      method: 'DELETE',
    });

    // Remove token on successful deletion
    if (response.success) {
      localStorage.removeItem('authToken');
    }

    return response;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('authToken');
  },

  // Test protected route
  testProtected: async () => {
    return apiCall('/auth/test');
  },
};

// Points API functions
export const pointsAPI = {
  // Get all points for the current user
  getUserPoints: async () => {
    return apiCall('/points');
  },

  // Add a new point
  addPoint: async (pointData) => {
    return apiCall('/add-point', {
      method: 'POST',
      body: JSON.stringify(pointData),
    });
  },

  // Update a point
  updatePoint: async (pointId, pointData) => {
    return apiCall(`/points/${pointId}`, {
      method: 'PUT',
      body: JSON.stringify(pointData),
    });
  },

  // Delete a point
  deletePoint: async (pointId) => {
    return apiCall(`/points/${pointId}`, {
      method: 'DELETE',
    });
  },

  // Get all points (public)
  getAllPoints: async () => {
    return apiCall('/points/all');
  },
};

// Health check
export const healthCheck = async () => {
  return apiCall('/health');
};

export default { authAPI, pointsAPI, healthCheck };
