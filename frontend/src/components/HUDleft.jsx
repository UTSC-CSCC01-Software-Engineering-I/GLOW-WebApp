"use client";

import React, { useEffect, useState } from 'react';
import '../styles/homepage.css';
import { ThemeManager } from '../utils/themeManager';


function LogoBlock() {
  const [theme, setTheme] = useState(() => ThemeManager.getTheme());
  
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


  return (
  
  <div >
    <div className='AppLogoBlock' style={{ border: theme === 'light'
          ? '1px solid rgba(255,255,255,0.3)'
          : '1px solid rgba(255,255,255,0.1)',
        boxShadow: theme === 'light'
          ? '0 8px 32px rgba(0,0,0,0.1)'
          : '0 8px 32px rgba(0,0,0,0.3)'}}>
        <h1 style={{ color: theme === 'dark' ? 'white': 'black', fontFamily: 'Inter', fontWeight: '900', 
          fontSize: '1.5rem'
        }}>GLOW</h1>
        <h1 style={{ color: 'gray', fontFamily: 'Inter', fontWeight: '300', 
          fontSize: '0.9rem', marginLeft: '0.5rem', marginTop: '0.5rem'
        }}>by MicroSofties</h1>
    </div>
  </div>
  

  );
}


export function HUDleft() {
  return <LogoBlock />;
}