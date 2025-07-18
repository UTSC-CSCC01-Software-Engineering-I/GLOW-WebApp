"use client";

import React, { useEffect, useState } from 'react';
import '../styles/homepage.css';


function MenuBlock({ theme }) {
  
  return (
    <div className='top-right-hud'>
    <div className='menu' style={{ backgroundColor: theme === 'dark' ? 'white': 'black' }}>
        <h1 style={{ color: theme === 'light' ? 'white': 'black', fontFamily: 'sans-serif', fontWeight: '900', 
          fontSize: '1.5rem', transform: 'rotate(90deg)'
        }}>|||</h1>
        
    </div>
  </div>
    
  
  );
}

export function HUDright() {
  const [theme, setTheme] = useState('dark');
    useEffect(() => {
      if (typeof window !== 'undefined' && window.globalTheme){
        setTheme(window.globalTheme);
      }
  
      const handleThemeChange = () => {
        setTheme(window.globalTheme); // update local state
      };
  
      window.addEventListener('themechange', handleThemeChange);
      return () => window.removeEventListener('themechange', handleThemeChange);
    }, []);

  return <MenuBlock theme={theme}/>;
}