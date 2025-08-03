"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeManager } from '../utils/themeManager';

function LoginBox({ theme, loading }) {
  const router = useRouter();
  return (      
    <div style={{ backgroundColor: !loading ? 'rgba(24, 210, 58, 0.96)': 'rgba(210, 24, 24, 0.4)', width: '19rem', height: '3rem', top: '1rem',
      right: '14.7rem', position: 'fixed', borderRadius: '0.6rem', display: 'flex', 
      alignItems: 'center', justifyContent: 'left', flexDirection: 'row-reverse', border: loading ? '1px solid red': '1px solid green',
      opacity: loading ? 1 : 0,
      transition: 'opacity 5s ease-in'}}>
        
        <div style={{ 
          color: 'white', 
          fontFamily: 'LEMONMILK, sans-serif', 
          fontWeight: '300', 
          fontSize: '1rem', 
          border: 'none',
          borderRadius: '0.6rem',
          backgroundColor: 'transparent',
          marginLeft:'1rem',
          cursor: 'pointer',
          width: 'auto',
          height: 'fit-content',
          display:'flex',
          flexDirection: 'row',
          gap: '0.5rem',
          alignItems: 'center'}}
        ><h1 style={{ fontSize: '1.4rem', marginBottom: '0.1rem' }}>🛈</h1>{loading ? 'Fetching latest data from api...' : 'Latest data loaded!'}</div>
  </div>
    
  
  );
}

export function HUDloading() {
  const [theme, setTheme] = useState(() => ThemeManager.getTheme());
  const [loading, setLoading] = useState(true);

    useEffect(() => {
      // Initialize theme using ThemeManager
      const currentTheme = ThemeManager.getTheme();
      setTheme(currentTheme);

      if (typeof window !== 'undefined' && window.loadedAPI){
        setLoading(window.loadedAPI);
      }
  
      // Listen for theme changes
      const removeThemeListener = ThemeManager.addThemeChangeListener((newTheme) => {
        setTheme(newTheme);
      });

      const handleLoadingText = () => {
        setLoading(window.loadedAPI); // update local state
      };
  
      window.addEventListener('dataloaded', handleLoadingText);

       return () => {
        removeThemeListener();
        window.removeEventListener('dataloaded', handleLoadingText);
      };
    }, []);

  return <LoginBox theme={theme} loading={loading}/>;
}
