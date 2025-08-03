"use client";

import React, { useEffect, useState } from 'react';
import { FullScreenMenu } from './FullScreenMenu';
import { HUDadd } from "../components/HUDadd";
import { ThemeManager } from '../utils/themeManager';
import '../styles/homepage.css';

function MenuBlock({ theme, onMenuToggle, isMenuOpen }) {
  
  return (
    <div className='top-right-hud'>
      <div className='menu' style={{ border: theme === 'light'
          ? '1px solid rgba(255,255,255,0.3)'
          : '1px solid rgba(255,255,255,0.1)',
        boxShadow: theme === 'light'
          ? '0 8px 32px rgba(0,0,0,0.1)'
          : '0 8px 32px rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)' }}>
        <button 
          className={`menubutton mobile-menu-btn-map ${isMenuOpen ? 'active' : ''}`}
          onClick={onMenuToggle}
          style={{ color: theme === 'dark' ? 'white': 'black', fontFamily: 'LEMONMILK, sans-serif'}}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>
  );
}

export function HUDright() {
  const [theme, setTheme] = useState(() => ThemeManager.getTheme());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

   useEffect(() => {
      const token = localStorage.getItem('authToken');
      setLoggedIn(!!token); // Update loggedIn state based on token existence
  });


  useEffect(() => {
    // Initialize theme using ThemeManager
    const currentTheme = ThemeManager.getTheme();
    setTheme(currentTheme);

    // Listen for theme changes
    const removeListener = ThemeManager.addThemeChangeListener((newTheme) => {
      setTheme(newTheme);
    });

    return removeListener;
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    
    console.log('Toggle theme clicked!'); // Debug log
    console.log('current login state:', loggedIn); // Debug log
    
    // Use ThemeManager to update theme globally
    // The map will automatically switch layers via its own theme listener
    ThemeManager.setTheme(newTheme);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>

      <HUDadd loggedIn={loggedIn} />
      <MenuBlock theme={theme} onMenuToggle={toggleMenu} isMenuOpen={isMenuOpen} />
      <FullScreenMenu 
        isOpen={isMenuOpen}
        onClose={closeMenu}
        theme={theme}
        toggleTheme={toggleTheme}
        loggedIn={loggedIn}
      />
    </>
  );
}
