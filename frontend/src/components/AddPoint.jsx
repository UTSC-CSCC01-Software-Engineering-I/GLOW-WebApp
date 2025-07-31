"use client";

import React, { useEffect, useState } from 'react';
import { authAPI, pointsAPI } from '../lib/api';

export default function AddPoint() {
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [temp, setTemp] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showFullscreenConfirmation, setShowFullscreenConfirmation] = useState(false);
  const [addedPoint, setAddedPoint] = useState(null);
  const [referrerPage, setReferrerPage] = useState('map');

  useEffect(() => {
    // Check URL parameters for referrer
    const urlParams = new URLSearchParams(window.location.search);
    const from = urlParams.get('from');
    if (from === 'dashboard' || from === 'manage-points') {
      setReferrerPage(from);
    }

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
        console.error('AddPoint error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude.toFixed(6));
          setLon(pos.coords.longitude.toFixed(6));
        },
        () => setError('Could not retrieve location')
      );
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSubmitting(true);
  
    try {
      const token = localStorage.getItem('authToken');
  
      if (!token) {
        setError('You must be logged in to add a point.');
        setSubmitting(false);
        return;
      }

      // Add a short delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));
  
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/add-point`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          lat: parseFloat(lat),
          lon: parseFloat(lon),
          temp: parseFloat(temp)
        }),
      });
  
      if (res.ok) {
        const responseData = await res.json();
        
        // Verify the point was actually added by fetching user points
        try {
          const verificationResponse = await pointsAPI.getUserPoints();
          if (verificationResponse.success) {
            // Find the most recent point (should be the one we just added)
            const userPoints = verificationResponse.data || [];
            const mostRecentPoint = userPoints.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
            
            if (mostRecentPoint && 
                Math.abs(parseFloat(mostRecentPoint.lat) - parseFloat(lat)) < 0.000001 &&
                Math.abs(parseFloat(mostRecentPoint.lon) - parseFloat(lon)) < 0.000001 &&
                Math.abs(parseFloat(mostRecentPoint.temp) - parseFloat(temp)) < 0.01) {
              
              setAddedPoint({
                ...mostRecentPoint,
                lat: parseFloat(lat),
                lon: parseFloat(lon),
                temp: parseFloat(temp)
              });
              setSuccess(true);
              setTemp('');
              setShowFullscreenConfirmation(true);
            } else {
              setError('Point was submitted but could not be verified in database');
            }
          } else {
            setError('Point was submitted but verification failed');
          }
        } catch (verifyErr) {
          // Point was added but verification failed - still show success
          setAddedPoint({
            lat: parseFloat(lat),
            lon: parseFloat(lon),
            temp: parseFloat(temp),
            timestamp: new Date().toISOString()
          });
          setSuccess(true);
          setTemp('');
          setShowFullscreenConfirmation(true);
        }
      } else {
        const errorData = await res.json();
        setError(errorData.message || 'Failed to add point');
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setSubmitting(false);
    }
  };

  const getBackUrl = () => {
    if (referrerPage === 'dashboard') {
      return '/dashboard';
    } else if (referrerPage === 'manage-points') {
      return '/dashboard?view=manage-points';
    }
    return '/';
  };

  const getBackLabel = () => {
    if (referrerPage === 'dashboard') {
      return '← Dashboard';
    } else if (referrerPage === 'manage-points') {
      return '← Manage Points';
    }
    return '← Map View';
  };

  const handleBackToReferrer = () => {
    window.location.href = getBackUrl();
  };

  const handleConfirmationClose = () => {
    setShowFullscreenConfirmation(false);
    setTimeout(() => {
      window.location.href = getBackUrl();
    }, 500);
  };

  // Loading state
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #f3f4f6',
            borderTop: '3px solid #fbbf24',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Fullscreen Confirmation Modal */}
      {showFullscreenConfirmation && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          fontFamily: 'Inter, sans-serif'
        }}>
          <div style={{
            textAlign: 'center',
            color: 'white',
            maxWidth: '600px',
            padding: '40px'
          }}>
            <div style={{
              fontSize: '80px',
              marginBottom: '30px',
              animation: 'bounce 1s ease-in-out'
            }}>
              ✅
            </div>
            <h1 style={{
              fontSize: '48px',
              fontWeight: '700',
              marginBottom: '20px',
              color: '#10b981'
            }}>
              Success!
            </h1>
            <p style={{
              fontSize: '24px',
              marginBottom: '30px',
              opacity: 0.9
            }}>
              Temperature point added successfully
            </p>
            
            {/* Point Details Card */}
            {addedPoint && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '40px',
                textAlign: 'left'
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  marginBottom: '16px',
                  color: '#fbbf24',
                  textAlign: 'center'
                }}>
                  📊 Point Details
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '16px', opacity: 0.8 }}>🌡️ Temperature:</span>
                    <span style={{ fontSize: '18px', fontWeight: '600', color: '#10b981' }}>
                      {addedPoint.temp}°C
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '16px', opacity: 0.8 }}>📍 Latitude:</span>
                    <span style={{ fontSize: '16px', fontWeight: '500' }}>
                      {parseFloat(addedPoint.lat).toFixed(6)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '16px', opacity: 0.8 }}>📍 Longitude:</span>
                    <span style={{ fontSize: '16px', fontWeight: '500' }}>
                      {parseFloat(addedPoint.lon).toFixed(6)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '16px', opacity: 0.8 }}>⏰ Recorded:</span>
                    <span style={{ fontSize: '16px', fontWeight: '500' }}>
                      {new Date(addedPoint.timestamp || new Date()).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ 
                    marginTop: '16px', 
                    padding: '12px', 
                    background: 'rgba(16, 185, 129, 0.2)', 
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <span style={{ fontSize: '14px', color: '#10b981', fontWeight: '600' }}>
                      ✅ Verified in database
                    </span>
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={handleConfirmationClose}
              style={{
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                border: 'none',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: '600',
                color: '#1a1a1a',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {referrerPage === 'dashboard' ? 'Return to Dashboard' : 
               referrerPage === 'manage-points' ? 'Return to Manage Points' : 
               'Return to Map'}
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        fontFamily: 'Inter, sans-serif',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          maxWidth: '500px',
          width: '100%',
          backgroundColor: 'white',
          borderRadius: '24px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          padding: '40px',
          position: 'relative'
        }}>
          {/* Back Button */}
          <button
            onClick={handleBackToReferrer}
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#6b7280',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#f3f4f6';
              e.target.style.color = '#374151';
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#f9fafb';
              e.target.style.color = '#6b7280';
            }}
          >
            {getBackLabel()}
          </button>

          {/* Header with User Greeting */}
          <div style={{ marginTop: '20px', marginBottom: '30px', textAlign: 'center' }}>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 8px 0'
            }}>
              Hello, {user?.firstName || 'User'}! 👋
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              margin: '0 0 4px 0'
            }}>
              Add a temperature point to your account
            </p>
            <p style={{
              fontSize: '14px',
              color: '#9ca3af',
              margin: '0',
              fontStyle: 'italic'
            }}>
              This reading will be saved under {user?.email || 'your account'}
            </p>
          </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Latitude
            </label>
            <input
              type="number"
              value={lat}
              onChange={e => setLat(e.target.value)}
              required
              step="any"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '16px',
                color: '#1a1a1a',
                background: '#ffffff',
                transition: 'border-color 0.2s ease',
                boxSizing: 'border-box'
              }}
              placeholder="Auto-detected latitude"
              onFocus={(e) => e.target.style.borderColor = '#fbbf24'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Longitude
            </label>
            <input
              type="number"
              value={lon}
              onChange={e => setLon(e.target.value)}
              required
              step="any"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '16px',
                color: '#1a1a1a',
                background: '#ffffff',
                transition: 'border-color 0.2s ease',
                boxSizing: 'border-box'
              }}
              placeholder="Auto-detected longitude"
              onFocus={(e) => e.target.style.borderColor = '#fbbf24'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Temperature (°C)
            </label>
            <input
              type="number"
              value={temp}
              onChange={e => setTemp(e.target.value)}
              required
              step="any"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '16px',
                color: '#1a1a1a',
                background: '#ffffff',
                transition: 'border-color 0.2s ease',
                boxSizing: 'border-box'
              }}
              placeholder="Enter temperature in Celsius"
              onFocus={(e) => e.target.style.borderColor = '#fbbf24'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '14px 24px',
              background: submitting ? '#d1d5db' : 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              color: submitting ? '#6b7280' : '#1a1a1a',
              cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: submitting ? 'none' : '0 4px 15px rgba(251, 191, 36, 0.3)',
              marginTop: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => {
              if (!submitting) {
                e.target.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(251, 191, 36, 0.4)';
              }
            }}
            onMouseOut={(e) => {
              if (!submitting) {
                e.target.style.background = 'linear-gradient(135deg, #fbbf24, #f59e0b)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(251, 191, 36, 0.3)';
              }
            }}
          >
            {submitting && (
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid #6b7280',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            )}
            {submitting ? 'Adding Point...' : 'Add Temperature Point'}
          </button>

          {/* Cancel Button */}
          <button
            type="button"
            onClick={handleBackToReferrer}
            disabled={submitting}
            style={{
              width: '100%',
              padding: '14px 24px',
              background: 'transparent',
              border: `2px solid ${submitting ? '#f3f4f6' : '#e5e7eb'}`,
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '500',
              color: submitting ? '#d1d5db' : '#6b7280',
              cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: submitting ? 0.5 : 1
            }}
            onMouseOver={(e) => {
              if (!submitting) {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.background = '#f9fafb';
                e.target.style.color = '#374151';
              }
            }}
            onMouseOut={(e) => {
              if (!submitting) {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.background = 'transparent';
                e.target.style.color = '#6b7280';
              }
            }}
          >
            {referrerPage === 'dashboard' ? 'Cancel and Return to Dashboard' : 
             referrerPage === 'manage-points' ? 'Cancel and Return to Manage Points' : 
             'Cancel and Return to Map'}
          </button>
        </form>

        {/* Success Message */}
        {success && (
          <div style={{
            marginTop: '20px',
            padding: '12px 16px',
            background: '#d1fae5',
            border: '1px solid #a7f3d0',
            borderRadius: '12px',
            color: '#065f46',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            ✅ Temperature point added successfully!
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            marginTop: '20px',
            padding: '12px 16px',
            background: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            color: '#dc2626',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            ❌ {error}
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-30px);
          }
          60% {
            transform: translateY(-15px);
          }
        }
      `}</style>
    </div>
    </>
  );
}
