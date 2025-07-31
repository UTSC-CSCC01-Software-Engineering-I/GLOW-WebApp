"use client";

import React, { useEffect, useState } from 'react';
import { authAPI } from '../../lib/api';
import '../../styles/dashboard.css';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState('light');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Handle theme
    if (typeof window !== 'undefined' && window.globalTheme) {
      setTheme(window.globalTheme);
    }

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handleThemeChange = () => {
      setTheme(window.globalTheme);
    };

    window.addEventListener('themechange', handleThemeChange);

    // Fetch user data
    const fetchUserData = async () => {
      try {
        if (!authAPI.isAuthenticated()) {
          window.location.href = '/';
          return;
        }

        const response = await authAPI.getProfile();
        if (response.success) {
          setUser(response.data.user);
        } else {
          setError('Failed to load user data');
        }
      } catch (err) {
        setError(err.message || 'Failed to load user data');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    return () => {
      window.removeEventListener('themechange', handleThemeChange);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const handleLogout = () => {
    authAPI.logout();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: '4px solid rgba(251, 191, 36, 0.3)', 
              borderTop: '4px solid #fbbf24', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite' 
            }}></div>
            <span>Loading your dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-error">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '2rem' }}>⚠️</span>
            <span>Error: {error}</span>
            <button 
              className="dashboard-btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get initials for avatar
  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || 'U'}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  // Calculate account age
  const getAccountAge = () => {
    // Mock data for demonstration
    return '2 months';
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="header-info">
              <h1>Welcome back, {user?.firstName || 'User'}! 👋</h1>
              <p>Manage your GLOW account and explore temperature data</p>
            </div>
            <div className="header-actions">
              <button
                onClick={() => window.location.href = '/'}
                className="dashboard-btn btn-secondary"
              >
                🗺️ Back to Map
              </button>
              <button
                onClick={handleLogout}
                className="dashboard-btn btn-danger"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="dashboard-main">
          {/* Profile Card */}
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar">
                {getInitials(user?.firstName, user?.lastName)}
              </div>
              <h2 className="profile-name">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : 'Welcome User'}
              </h2>
              <p className="profile-email">{user?.email || 'No email provided'}</p>
            </div>

            <div className="profile-fields">
              <div className="field-group">
                <label className="field-label">First Name</label>
                <div className="field-value">
                  {user?.firstName || 'Not provided'}
                </div>
              </div>
              
              <div className="field-group">
                <label className="field-label">Last Name</label>
                <div className="field-value">
                  {user?.lastName || 'Not provided'}
                </div>
              </div>
              
              <div className="field-group">
                <label className="field-label">Email Address</label>
                <div className="field-value">
                  {user?.email || 'Not provided'}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="stats-card">
            <div className="stats-header">
              <h3 className="stats-title">Account Overview</h3>
              <p className="stats-subtitle">Your GLOW activity summary</p>
            </div>

            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-icon">📅</span>
                <div className="stat-value">{getAccountAge()}</div>
                <div className="stat-label">Member Since</div>
              </div>
              
              <div className="stat-item">
                <span className="stat-icon">🌡️</span>
                <div className="stat-value">0</div>
                <div className="stat-label">Data Points Added</div>
              </div>
              
              <div className="stat-item">
                <span className="stat-icon">🔍</span>
                <div className="stat-value">0</div>
                <div className="stat-label">Map Views</div>
              </div>
              
              <div className="stat-item">
                <span className="stat-icon">⭐</span>
                <div className="stat-value">New</div>
                <div className="stat-label">Status</div>
              </div>
            </div>

            <div style={{ 
              marginTop: '2rem', 
              padding: '1.5rem', 
              background: 'rgba(251, 191, 36, 0.1)', 
              borderRadius: '16px', 
              border: '2px solid rgba(251, 191, 36, 0.2)',
              textAlign: 'center'
            }}>
              <h4 style={{ 
                margin: '0 0 0.5rem 0', 
                color: '#1a1a1a', 
                fontSize: '1.1rem', 
                fontWeight: '600' 
              }}>
                🚀 Ready to explore?
              </h4>
              <p style={{ 
                margin: '0 0 1rem 0', 
                color: '#666', 
                fontSize: '0.95rem' 
              }}>
                Start by checking out the temperature data on our interactive map!
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="dashboard-btn btn-primary"
                style={{ margin: 0 }}
              >
                Explore Map 🗺️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}