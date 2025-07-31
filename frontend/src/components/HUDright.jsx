"use client";

import React, { useEffect, useState } from 'react';
import { FullScreenMenu } from './FullScreenMenu';
import '../styles/homepage.css';

function MenuBlock({ theme, onMenuToggle }) {
  
  return (
    <div className='top-right-hud'>
    <div className='menu' style={{ backgroundColor: theme === 'dark' ? 'white': 'black' }}>
        <button 
          className='menubutton' 
          onClick={onMenuToggle}
          style={{ color: theme === 'light' ? 'white': 'black', fontFamily: 'Inter, sans-serif'}}
        >
          |||
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
    if (typeof window !== 'undefined' && window.globalTheme){
      setTheme(window.globalTheme);
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
    
    // Update global theme
    if (typeof window !== 'undefined') {
      window.globalTheme = newTheme;
      window.dispatchEvent(new Event('themechange')); // Add this line!
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
      setTheme('dark');
    } else {
      console.log('Switching to light theme');
      map.removeLayer(darkLayer);
      map.addLayer(lightLayer);
      setTheme('light');
    }


  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <MenuBlock theme={theme} onMenuToggle={toggleMenu} />
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