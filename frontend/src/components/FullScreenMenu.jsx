"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import '../styles/FullScreenMenu.css';

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
    localStorage.removeItem('authToken');
    window.location.reload();
    onClose();
  };


  return (
    <>
      <div 
        className={`map-mobile-sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
      ></div>
      <div className={`map-mobile-sidebar ${isOpen ? 'active' : ''}`}>
        <div className="map-sidebar-header">
          <h1 className='map-logotop'>GLOW</h1>
          <h2 className='map-logobottom'>by Microsofties</h2>
        </div>
        
        <div className="map-menu-items">
          <div 
            className="map-nav-item"
            onClick={() => {
              loggedIn ? router.push('/add-point') : router.push('/default');
              onClose();
            }}
          >
            <span className="map-nav-icon">+</span>
            <span>Add Water Point</span>
          </div>
          
          <div 
            className="map-nav-item"
            onClick={() => {
              toggleTheme();
              onClose();
            }}
          >
            <span className="map-nav-icon">{theme === 'dark' ? '☀' : '🌙'}</span>
            <span>Switch to {theme === 'dark' ? 'Light' : 'Dark'} Theme</span>
          </div>

          {!loggedIn ? (
            <div 
              className="map-nav-item"
              onClick={handleLogin}
            >
              <span className="map-nav-icon">👤</span>
              <span>Login / Sign Up</span>
            </div>
          ) : (
            <div 
              className="map-nav-item"
              onClick={handleDashboard}
            >
              <span className="map-nav-icon">👤</span>
              <span>User Dashboard</span>
            </div>
          )}

          {loggedIn && (
            <div 
              className="map-nav-item map-nav-logout"
              onClick={handleLogout}
            >
              <span className="map-nav-icon">🚪</span>
              <span>Logout</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
