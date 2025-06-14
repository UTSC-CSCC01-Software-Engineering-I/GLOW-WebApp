"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function LoginBox({ toggleTheme, theme }) {
  const router = useRouter();
  return (
    <div className='top-right-hud'>
      <div style={{ backgroundColor: theme === 'light' ? 'rgb(255, 255, 255)': 'black', width: '2.5rem', height: '2.5rem', top: '1.2rem',
      right: '4.2rem', position: 'fixed', borderRadius: '4rem', display: 'flex'}}>
          <button onClick={toggleTheme} style={{ 
                  color: theme === 'dark' ? 'yellow': 'black',
                  fontFamily: 'sans-serif', 
                  fontWeight: '900', 
                  fontSize: '1.5rem', 
                  border: 'none',
                  borderRadius: '4rem',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  width: '100%',
                  height: '100%',
                  
                  
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0, 217, 255, 0.6)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >{ theme === 'light' ? '⏾' : '☀'}</button></div>
      
    <div style={{ backgroundColor: theme === 'light' ? 'white': 'black', width: '7rem', height: '3rem', top: '1rem',
      right: '7.2rem', position: 'fixed', borderRadius: '0.6rem', display: 'flex', 
      alignItems: 'center', justifyContent: 'center', flexDirection: 'row-reverse'}}>
        
        <button onClick={() => router.push('/default')} style={{ 
          color: theme === 'dark' ? 'white': 'black', 
          fontFamily: 'hubot', 
          fontWeight: '400', 
          fontSize: '1rem', 
          border: 'none',
          borderRadius: '0.6rem',
          backgroundColor: 'transparent',
          cursor: 'pointer',
          width: '100%',
          height: '100%'
          
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0, 217, 255, 0.6)'}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >login</button>
        
        
    </div>
  </div>
    
  
  );
}

export function HUDlogin() {
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

  return <LoginBox toggleTheme={toggleTheme} theme={theme}/>;
}