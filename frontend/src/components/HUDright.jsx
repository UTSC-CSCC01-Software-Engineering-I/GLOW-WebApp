"use client";

import React, { useEffect, useState } from 'react';

function MenuBlock({ theme }) {
  
  return (
    <div className='top-right-hud'>
    <div style={{ backgroundColor: theme === 'dark' ? 'white': 'black', width: '13rem', height: '3rem', top: '1rem',
      right: '1rem', position: 'fixed', borderRadius: '0.6rem', display: 'flex', 
      alignItems: 'center', justifyContent: 'right', paddingRight: '1rem', flexDirection: 'row-reverse'}}>
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