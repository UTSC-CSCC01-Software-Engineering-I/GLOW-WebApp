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
    <div style={{ backgroundColor: theme === 'light' ? 'white': 'black', width: '18rem', height: '3rem', top: '1rem',
      left: '1rem', position: 'fixed', borderRadius: '0.6rem', display: 'flex', 
      alignItems: 'center', justifyContent: 'left', paddingLeft: '1rem'}}>
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