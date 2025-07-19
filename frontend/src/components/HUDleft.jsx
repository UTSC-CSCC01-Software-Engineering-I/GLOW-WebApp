"use client";

import React, { useEffect, useState } from 'react';
import '../styles/homepage.css';


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
  
  <div >
    <div className='AppLogoBlock' style={{ }}>
        <h1 style={{ color: theme === 'dark' ? 'white': 'black', fontFamily: 'inter', fontWeight: '900', 
          fontSize: '1.5rem'
        }}>GLOW</h1>
        <h1 style={{ color: 'gray', fontFamily: 'monospace', fontWeight: '300', 
          fontSize: '0.9rem', marginLeft: '0.5rem', marginTop: '0.5rem'
        }}>by MicroSofties</h1>
    </div>
  </div>
  

  );
}


export function HUDleft() {
  return <LogoBlock />;
}