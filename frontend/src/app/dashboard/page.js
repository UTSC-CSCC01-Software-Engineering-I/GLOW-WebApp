"use client";

import React, { useEffect, useState } from 'react';
import { authAPI, pointsAPI } from '../../lib/api';
import '../../styles/dashboard.css';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [userPoints, setUserPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pointsLoading, setPointsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState('light');
  const [isMobile, setIsMobile] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showPoints, setShowPoints] = useState(true);

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
          // Fetch user points after getting user data
          await fetchUserPoints();
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

    // Fetch user points
    const fetchUserPoints = async () => {
      setPointsLoading(true);
      try {
        const response = await pointsAPI.getUserPoints();
        if (response.success) {
          setUserPoints(response.data || []);
        } else {
          console.error('Failed to fetch user points:', response.message);
          setUserPoints([]);
        }
      } catch (err) {
        console.error('Error fetching user points:', err);
        setUserPoints([]);
      } finally {
        setPointsLoading(false);
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

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Compact Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="header-info">
              <h1>Hi {user?.firstName || 'User'}! 👋</h1>
              <p>You have {userPoints.length} temperature point{userPoints.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="header-actions">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className={`dashboard-btn ${showProfile ? 'btn-primary' : 'btn-secondary'}`}
              >
                👤 Profile
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="dashboard-btn btn-secondary"
              >
                🗺️ Map
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
          {/* Collapsible Profile Section */}
          {showProfile && (
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
          )}

          {/* User Points Section */}
          <div className="points-card">
            <div className="points-header">
              <h3 className="points-title">Your Temperature Points 🌡️</h3>
              <p className="points-subtitle">
                {userPoints.length === 0 
                  ? 'No points added yet' 
                  : `${userPoints.length} point${userPoints.length !== 1 ? 's' : ''} contributed`}
              </p>
            </div>

            {pointsLoading ? (
              <div className="points-loading">
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: '1rem',
                  padding: '2rem'
                }}>
                  <div style={{ 
                    width: '30px', 
                    height: '30px', 
                    border: '3px solid rgba(251, 191, 36, 0.3)', 
                    borderTop: '3px solid #fbbf24', 
                    borderRadius: '50%', 
                    animation: 'spin 1s linear infinite' 
                  }}></div>
                  <span>Loading your points...</span>
                </div>
              </div>
            ) : userPoints.length === 0 ? (
              <div className="no-points">
                <div style={{ 
                  textAlign: 'center', 
                  padding: '3rem 2rem',
                  color: '#666'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌡️</div>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: '600' }}>
                    No temperature points yet
                  </h4>
                  <p style={{ margin: '0 0 1.5rem 0', fontSize: '1rem' }}>
                    Start contributing to our temperature database by adding your first point!
                  </p>
                  <button
                    onClick={() => window.location.href = '/add-point'}
                    className="dashboard-btn btn-primary"
                  >
                    Add Your First Point 📍
                  </button>
                </div>
              </div>
            ) : (
              <div className="points-list">
                {userPoints.map((point, index) => (
                  <div key={index} className="point-item">
                    <div className="point-info">
                      <div className="point-temp">
                        <span className="temp-value">{point.temp}°C</span>
                        <span className="temp-label">Temperature</span>
                      </div>
                      <div className="point-location">
                        <span className="location-coords">
                          {parseFloat(point.lat).toFixed(4)}, {parseFloat(point.lon).toFixed(4)}
                        </span>
                        <span className="location-label">Coordinates</span>
                      </div>
                      <div className="point-date">
                        <span className="date-value">{formatDate(point.timestamp)}</span>
                        <span className="date-label">Added</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {userPoints.length > 0 && (
              <div className="points-footer">
                <button
                  onClick={() => window.location.href = '/add-point'}
                  className="dashboard-btn btn-primary"
                  style={{ width: '100%' }}
                >
                  Add Another Point 📍
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}