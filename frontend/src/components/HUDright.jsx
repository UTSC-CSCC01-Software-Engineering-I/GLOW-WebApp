"use client";

import React, { useEffect, useState } from 'react';
import { FullScreenMenu } from './FullScreenMenu';
import { HUDadd } from "../components/HUDadd";
import '../styles/homepage.css';

function MenuBlock({ theme, onMenuToggle, isMenuOpen }) {
  
  return (
    <div className='top-right-hud'>
      <div className='menu' style={{ backgroundColor: theme === 'dark' ? 'white': 'black' }}>
        <button 
          className={`menubutton mobile-menu-btn-map ${isMenuOpen ? 'active' : ''}`}
          onClick={onMenuToggle}
          style={{ color: theme === 'light' ? 'white': 'black', fontFamily: 'Inter, sans-serif'}}
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
  const [theme, setTheme] = useState('dark');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

   useEffect(() => {
      const token = localStorage.getItem('authToken');
      setLoggedIn(!!token); // Update loggedIn state based on token existence
  });


  useEffect(() => {
    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      if (typeof window !== 'undefined') {
        window.globalTheme = savedTheme;
      }
    } else if (typeof window !== 'undefined' && window.globalTheme) {
      setTheme(window.globalTheme);
    } else {
      // Default to system preference
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setTheme(systemTheme);
      localStorage.setItem('theme', systemTheme);
      if (typeof window !== 'undefined') {
        window.globalTheme = systemTheme;
      }
    }

    const handleThemeChange = () => {
      setTheme(window.globalTheme);
    };

    window.addEventListener('themechange', handleThemeChange);
    return () => window.removeEventListener('themechange', handleThemeChange);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    
    // Save to localStorage
    localStorage.setItem('theme', newTheme);
    
    // Update global theme
    if (typeof window !== 'undefined') {
      window.globalTheme = newTheme;
      window.dispatchEvent(new Event('themechange'));
    }

    console.log('Toggle theme clicked!'); // Debug log
    console.log('current login state:', loggedIn); // Debug log
    
    const map = window.leafletMap;
    const lightLayer = window.lightLayer;
    const darkLayer = window.darkLayer;

    console.log('Map:', map, 'Light:', lightLayer, 'Dark:', darkLayer); // Debug log

    if (!map || !lightLayer || !darkLayer) {
      console.log('Map or layers not available yet');
      return;
    }

    if (theme === 'light') {
      console.log('Switching to dark theme');
      map.removeLayer(lightLayer);
      map.addLayer(darkLayer);
    } else {
      console.log('Switching to light theme');
      map.removeLayer(darkLayer);
      map.addLayer(lightLayer);
    }
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