"use client";

import React, { useEffect, useState } from 'react';


function LogoBlock() {
  const [theme, setTheme] = useState('light');
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
    
  return (
  
    <div className='top-left-hud'>
    <div style={{ backgroundColor: theme === 'light' ? 'white': 'black', width: '18rem', height: '80vh', top: '4.5rem',
      left: '1rem', position: 'fixed', borderRadius: '0.6rem'}}>

    </div>
  </div>
  
  
  );
}


export function HUDleftPoints() {
  return <LogoBlock />;
}