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
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard', 'manage-points', 'manage-profile'
  const [editingPoint, setEditingPoint] = useState(null);
  const [editForm, setEditForm] = useState({ temp: '', lat: '', lon: '' });
  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);


  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Check URL parameters for active view
    const urlParams = new URLSearchParams(window.location.search);
    const view = urlParams.get('view');
    if (view === 'manage-points' || view === 'manage-profile') {
      setActiveView(view);
    }
  }, []);

  useEffect(() => {
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
          setProfileForm({
            firstName: response.data.user.firstName || '',
            lastName: response.data.user.lastName || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
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
  }, []);

  const handleLogout = () => {
    authAPI.logout();
    window.location.href = '/';
  };

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

  // Get sorted points
  const getSortedPoints = () => {
    const sorted = [...userPoints];
    return sorted.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  // Get temperature statistics
  const getTempStats = () => {
    if (userPoints.length === 0) return { avg: 0, min: 0, max: 0 };
    const temps = userPoints.map(p => parseFloat(p.temp));
    return {
      avg: (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1),
      min: Math.min(...temps).toFixed(1),
      max: Math.max(...temps).toFixed(1)
    };
  };

  const tempStats = getTempStats();

  // Handle point deletion
  const handleDeletePoint = async (pointId) => {
    if (!window.confirm('Are you sure you want to delete this point?')) {
      return;
    }

    try {
      const response = await pointsAPI.deletePoint(pointId);
      if (response.success) {
        setUserPoints(userPoints.filter(point => point._id !== pointId));
      } else {
        alert('Failed to delete point: ' + response.message);
      }
    } catch (error) {
      console.error('Error deleting point:', error);
      alert('Error deleting point: ' + error.message);
    }
  };

  // Handle point editing
  const handleEditPoint = (point) => {
    setEditingPoint(point);
    setEditForm({
      temp: point.temp,
      lat: point.lat,
      lon: point.lon
    });
  };

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await pointsAPI.updatePoint(editingPoint._id, editForm);
      if (response.success) {
        setUserPoints(userPoints.map(point => 
          point._id === editingPoint._id 
            ? { ...point, ...editForm }
            : point
        ));
        setEditingPoint(null);
        setEditForm({ temp: '', lat: '', lon: '' });
      } else {
        alert('Failed to update point: ' + response.message);
      }
    } catch (error) {
      console.error('Error updating point:', error);
      alert('Error updating point: ' + error.message);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingPoint(null);
    setEditForm({ temp: '', lat: '', lon: '' });
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    try {
      const updateData = {
        firstName: profileForm.firstName,
        lastName: profileForm.lastName
      };

      if (profileForm.newPassword) {
        updateData.currentPassword = profileForm.currentPassword;
        updateData.newPassword = profileForm.newPassword;
      }

      const response = await authAPI.updateProfile(updateData);
      if (response.success) {
        setUser({ ...user, firstName: profileForm.firstName, lastName: profileForm.lastName });
        setProfileForm({
          ...profileForm,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile: ' + response.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile: ' + error.message);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await authAPI.deleteAccount();
      if (response.success) {
        alert('Account deleted successfully');
        authAPI.logout();
        window.location.href = '/';
      } else {
        alert('Failed to delete account: ' + response.message);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Error deleting account: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div className="spinner"></div>
          <span>Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-error">
          <span style={{ fontSize: '2rem' }}>⚠️</span>
          <span>Error: {error}</span>
          <button 
            className="add-btn"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Left Sidebar */}
        <div className="sidebar">
          <h1 className='logotop' style={{ fontFamily: 'inter'}}
          >GLOW</h1>
          <h2 className='logobottom'>by Microsofties</h2>
          <div className="user-profile">
            
            <div className="mapbut nav-item " onClick={() => window.location.href = '/'}
              >
                <span>▶ Open Maps </span>
            </div>
          </div>
          
          <nav className="sidebar-nav">
               
            <div className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveView('dashboard')}>
              <span className="nav-icon"></span>
              <span>Dashboard</span>
            </div>
            <div className={`nav-item ${activeView === 'manage-points' ? 'active' : ''}`} onClick={() => setActiveView('manage-points')}>
              <span className="nav-icon"></span>
              <span>Manage Points</span>
            </div>
            <div className={`nav-item ${activeView === 'manage-profile' ? 'active' : ''}`} onClick={() => setActiveView('manage-profile')}>
              <span className="nav-icon"></span>
              <span>Manage Profile</span>
            </div>
           

            <div className="nav-item del " onClick={handleLogout}>
                   <span>🢀 Logout</span>
                </div>
          </nav>
        </div>
        
        {/* Main Content */}
        <div className="main-content">
          {activeView === 'dashboard' && (
            <>
              {/* Header */}
              <div className="content-header">
                <div className="welcome-section">
                  <h1>Welcome, {user?.firstName || 'User'} {user?.lastName || 'User'}</h1>
                
                  <p>{user?.email || 'user@example.com'}</p>
                  <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                
                <div className="header-actions">
               
                  
                </div>
              </div>

              {/* Bottom Section */}
              <div className="bottom-section">
                {/* Statistics */}
                <div className="dashboard-card">
                  <div className="statistics-section">
                    <h3>Your Statistics</h3>
                    <div className="stat-item">
                      <div className="stat-number">{userPoints.length}</div>
                      <div className="stat-label">Points<br/> Contributed</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">{tempStats.max}</div>
                      <div className="stat-label">Max<br/>Temperature From Contributions</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">{tempStats.min}</div>
                      <div className="stat-label">Min<br/>Temperature From Contributions</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">{tempStats.avg}</div>
                      <div className="stat-label">Average<br/>Temperature From Contributions</div>
                    </div>
                    
                  </div>
                </div>
                {/* Tasks for today */}
                <div className="dashboard-card">
                  <div className="tasks-section">
                    <h3>Recent Activity</h3>
                    {userPoints.length === 0 ? (
                      <div className="empty-task">
                        <div className="task-icon orange"></div>
                        <div className="task-content">
                          <h4>Add your first temperature point</h4>
                          <p>Start contributing to our weather database</p>
                        </div>
                      </div>
                    ) : (
                      <div className="tasks-list">
                        {getSortedPoints().slice(0, 3).map((point, index) => (
                          <div key={index} className="task-item">
                            <div className={`task-icon ${index === 0 ? 'orange' : index === 1 ? 'purple' : 'teal'}`}></div>
                            <div className="task-content">
                              <h4>Temperature Reading</h4>
                              <p>{point.temp}°C at {parseFloat(point.lat).toFixed(2)}, {parseFloat(point.lon).toFixed(2)}</p>
                            </div>
                            
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                
              </div>
            </>
          )}

          {activeView === 'manage-points' && (
            <div className="manage-points-content">
              <div className="content-header">
                <div className="welcome-section">
                  <h1>Manage Your Points</h1>
                  <p>Edit or delete your temperature readings</p>
                </div>
                <div className="header-actions">
                  <button 
                    className="add-btn"
                    onClick={() => window.location.href = '/add-point?from=manage-points'}
                  >
                    Add New Point
                  </button>
                </div>
              </div>

              <div className="points-management">
                {userPoints.length === 0 ? (
                  <div className="no-points-message">
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📍</div>
                    <h3>No points yet</h3>
                    <p>You haven't added any temperature points yet.</p>
                    <button 
                      className="add-btn"
                      onClick={() => window.location.href = '/add-point?from=manage-points'}
                    >
                      Add Your First Point
                    </button>
                  </div>
                ) : (
                  <div className="points-grid">
                    {getSortedPoints().map((point, index) => (
                      <div key={point._id || index} className="point-card">
                        {editingPoint && editingPoint._id === point._id ? (
                          <form onSubmit={handleEditSubmit} className="edit-form">
                            <div className="form-row">
                              <input
                                type="number"
                                step="0.1"
                                placeholder="Temperature (°C)"
                                value={editForm.temp}
                                onChange={(e) => setEditForm({...editForm, temp: e.target.value})}
                                required
                              />
                              <input
                                type="number"
                                step="any"
                                placeholder="Latitude"
                                value={editForm.lat}
                                onChange={(e) => setEditForm({...editForm, lat: e.target.value})}
                                required
                              />
                              <input
                                type="number"
                                step="any"
                                placeholder="Longitude"
                                value={editForm.lon}
                                onChange={(e) => setEditForm({...editForm, lon: e.target.value})}
                                required
                              />
                            </div>
                            <div className="form-actions">
                              <button type="submit" className="save-btn">Save</button>
                              <button type="button" className="cancel-btn" onClick={handleCancelEdit}>Cancel</button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <div className="point-info">
                              <div className="point-temp">{point.temp}°C</div>
                              <div className="point-coords">
                                Lat: {parseFloat(point.lat).toFixed(4)}<br/>
                                Lon: {parseFloat(point.lon).toFixed(4)}
                              </div>
                              <div className="point-date">{formatDate(point.timestamp)}</div>
                            </div>
                            <div className="point-actions">
                              <button 
                                className="edit-btn"
                                onClick={() => handleEditPoint(point)}
                              >
                                ✏️ Edit
                              </button>
                              <button 
                                className="delete-btn"
                                onClick={() => handleDeletePoint(point._id)}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeView === 'manage-profile' && (
            <div className="manage-profile-content">
              <div className="content-header">
                <div className="welcome-section">
                  <h1>Manage Profile</h1>
                  <p>Update your account information</p>
                </div>
              </div>

              <div className="profile-management">
                <div className="profile-form-container">
                  <form onSubmit={handleProfileUpdate} className="profile-form">
                    <div className="form-section">
                      <h3>Personal Information</h3>
                      <div className="form-group">
                        <label>First Name</label>
                        <input
                          type="text"
                          value={profileForm.firstName}
                          onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Last Name</label>
                        <input
                          type="text"
                          value={profileForm.lastName}
                          onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-section">
                      <h3>Change Password</h3>
                      <p className="form-note">Leave blank to keep current password</p>
                      <div className="form-group">
                        <label>Current Password</label>
                        <input
                          type="password"
                          value={profileForm.currentPassword}
                          onChange={(e) => setProfileForm({...profileForm, currentPassword: e.target.value})}
                          placeholder="Enter current password"
                        />
                      </div>
                      <div className="form-group">
                        <label>New Password</label>
                        <input
                          type="password"
                          value={profileForm.newPassword}
                          onChange={(e) => setProfileForm({...profileForm, newPassword: e.target.value})}
                          placeholder="Enter new password"
                        />
                      </div>
                      <div className="form-group">
                        <label>Confirm New Password</label>
                        <input
                          type="password"
                          value={profileForm.confirmPassword}
                          onChange={(e) => setProfileForm({...profileForm, confirmPassword: e.target.value})}
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="save-profile-btn">Update Profile</button>
                    </div>
                  </form>

                  <div className="danger-zone">
                    <h3>Danger Zone</h3>
                    <p>Once you delete your account, there is no going back. Please be certain.</p>
                    <button 
                      className="delete-account-btn"
                      onClick={handleDeleteAccount}
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      
      </div>
    </div>
  );
}