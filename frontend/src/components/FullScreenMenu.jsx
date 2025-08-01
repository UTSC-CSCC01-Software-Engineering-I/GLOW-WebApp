"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UnitManager } from '../utils/unitManager';
import '../styles/FullScreenMenu.css';


export function FullScreenMenu({ isOpen, onClose, theme, toggleTheme, loggedIn }) {
  const router = useRouter();
  const [unit, setUnit] = useState(() => UnitManager.getUnit());

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

  // Listen for unit changes
  useEffect(() => {
    // Initialize unit using UnitManager
    const currentUnit = UnitManager.getUnit();
    setUnit(currentUnit);

    // Listen for unit changes
    const removeListener = UnitManager.addUnitChangeListener((newUnit) => {
      setUnit(newUnit);
    });

    return removeListener;
  }, []);

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

  const toggleUnit = () => {
    const newUnit = unit === 'C' ? 'F' : 'C';
    UnitManager.setUnit(newUnit);
  };


  return (
    <>
      <div 
        className={`map-mobile-sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
      ></div>
      <div className={`map-mobile-sidebar ${isOpen ? 'active' : ''}`}>
        <div className="map-sidebar-header">
          
          <h1 className='map-logotop' style={{ fontFamily: 'inter'}}>glow</h1>
          <h2 className='map-logobottom' style={{ fontFamily: 'inter'}} >by MicroSofties</h2>
          
        </div>
        
        <div className="map-menu-items">
          <div 
              className="map-nav-item active"
              
            >
              <span>MAPS</span>
            </div>
          {!loggedIn ? (
            <div 
              className="map-nav-item"
              onClick={handleLogin}
            >
              <span>Login / Sign Up</span>
            </div>
          ) : (
            <div 
              className="map-nav-item"
              onClick={handleDashboard}
            >
              <span>User Dashboard</span>
            </div>
          )}
          <div 
            className="map-nav-item map-add-point"
            onClick={() => {
              loggedIn ? router.push('/add-point') : router.push('/default');
              onClose();
            }}
          >
            <span className="map-nav-icon">+</span>
            <span>Add Water Point</span>
          </div>
          
          <div 
            className="map-nav-item map-theme-toggle"
            onClick={() => {
              toggleTheme();
              onClose();
            }}
          >
            <span className="map-nav-icon">{theme === 'dark' ? '☀' : '🌙'}</span>
            <span>Switch to {theme === 'dark' ? 'Light' : 'Dark'} Theme</span>
          </div>

          <div 
            className="map-nav-item map-unit-toggle"
            onClick={() => {
              toggleUnit();
              onClose();
            }}
          >
            <span className="map-nav-icon">°{unit}</span>
            <span>Switch to °{unit === 'C' ? 'F' : 'C'}</span>
          </div>

          

          {loggedIn && (
            <div 
              className="map-nav-item map-nav-logout"
              onClick={handleLogout}
            >
              <span>🢀 Logout</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
