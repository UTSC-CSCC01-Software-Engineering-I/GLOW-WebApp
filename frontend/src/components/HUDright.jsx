"use client";

import React, { useEffect, useState } from 'react';

function MenuBlock({ toggleTheme, theme }) {
  return (
    <div className='top-right-hud'>
    <div style={{ backgroundColor: theme === 'light' ? 'white': 'black', width: '8rem', height: '3rem', top: '1rem',
      right: '1rem', position: 'fixed', borderRadius: '0.6rem', display: 'flex', 
      alignItems: 'center', justifyContent: 'right', paddingRight: '1rem', flexDirection: 'row-reverse'}}>
        <h1 style={{ color: theme === 'dark' ? 'white': 'black', fontFamily: 'sans-serif', fontWeight: '900', 
          fontSize: '1.5rem', transform: 'rotate(90deg)'
        }}>|||</h1>
        <button onClick={toggleTheme} style={{ 
          color: 'white', 
          fontFamily: 'sans-serif', 
          fontWeight: '900', 
          fontSize: '1.5rem', 
          width: '2.5rem', 
          height: '2.5rem',
          border: 'none',
          borderRadius: '0.3rem',
          backgroundColor: 'transparent',
          cursor: 'pointer',
          marginRight: '2.9rem',
          marginBottom: '0.1rem'
          
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >{ theme === 'light' ? '🌙' : '☀️'}</button>
    </div>
  </div>
    
  
  );
}

export function HUDright() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    window.globalTheme = theme;
    window.dispatchEvent(new Event('themechange'));
  });

  const toggleTheme = () => {
    console.log('Toggle theme clicked!'); // Debug log
    
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

  return <MenuBlock toggleTheme={toggleTheme} theme={theme}/>;
}