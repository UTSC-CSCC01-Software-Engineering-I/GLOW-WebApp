"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function FullScreenMenu({ isOpen, onClose, theme, toggleTheme, loggedIn }) {
  const router = useRouter();

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleLogin = () => {
    router.push('/default');
    onClose();
  };

  const handleDashboard = () => {
    router.push('/dashboard');
    onClose();
  };

  const handleLogout = () => {
    // Add logout logic here
    onClose();
  };

 
  if (!isOpen) return null;

  return (
    <div className="fullscreen-menu-overlay" onClick={onClose}>
      <div className="fullscreen-menu-content" onClick={(e) => e.stopPropagation()}>
        <div className="menu-header">
          <h1 style={{ 
            color: 'white',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '900',
            fontSize: '3rem',
            margin: 0
          }}>
            MENU
          </h1>
          <button 
            className="close-button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '2rem',
              cursor: 'pointer',
              padding: '0.5rem'
            }}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>
        

        <div className="menu-items">
          <div className="menu-item">
            <button 
              onClick={() => {loggedIn ? (router.push('/add-point')) : (router.push('/default'))
                onClose();
              }}
              className="menu-action-button"
              style={{
                backgroundColor: '#28a745',
                color: 'white'
              }}
            >
              <span style={{ fontSize: '2rem', marginRight: '1rem' }}>
                +
              </span>
              Add Water Point
            </button>
          </div>
          <div className="menu-item">
            <button 
              onClick={toggleTheme}
              className="menu-action-button"
              style={{
                backgroundColor: theme === 'dark' ? 'white' : 'black',
                color: theme === 'dark' ? 'black' : 'white', border: "1px solid white"
              }}
            >
              <span style={{ fontSize: '2rem', marginRight: '1rem' }}>
                {theme === 'dark' ? '☀' : '🌙'}
              </span>
              Switch to {theme === 'dark' ? 'Light' : 'Dark'} Theme
            </button>
          </div>

          <div className="menu-item">
            {!loggedIn ? (
              <button 
                onClick={handleLogin}
                className="menu-action-button"
                style={{
                  backgroundColor: '#007acc',
                  color: 'white'
                }}
              >
                <span style={{ fontSize: '2rem', marginRight: '1rem' }}>
                  👤
                </span>
                Login / Sign Up
              </button>
            ) : (
              <button 
                onClick={handleDashboard}
                className="menu-action-button"
                style={{
                  backgroundColor: '#007acc',
                  color: 'white'
                }}
              >
                <span style={{ fontSize: '2rem', marginRight: '1rem' }}>
                  👤
                </span>
                User Dashboard
              </button>
            )}
          </div>

          {loggedIn && (
            <div className="menu-item">
              <button 
                onClick={handleLogout}
                className="menu-action-button"
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white'
                }}
              >
                <span style={{ fontSize: '1.5rem', marginRight: '1rem' }}>
                  🚪
                </span>
                Logout
              </button>
            </div>
          )}

          
        </div>
      </div>
    </div>
  );
}
