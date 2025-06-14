"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function LoginBox({ theme, loading }) {
  const router = useRouter();
  return (      
    <div style={{ backgroundColor: !loading ? 'rgba(24, 210, 58, 0.78)': 'rgba(210, 24, 24, 0.4)', width: '19rem', height: '3rem', top: '1rem',
      right: '14.7rem', position: 'fixed', borderRadius: '0.6rem', display: 'flex', 
      alignItems: 'center', justifyContent: 'left', flexDirection: 'row-reverse', 
      opacity: loading ? 1 : 0,
      transition: 'opacity 8s ease',}}>
        
        <h1 style={{ 
          color: theme === 'dark' ? 'white': 'black', 
          fontFamily: 'hubot sans', 
          fontWeight: '300', 
          fontSize: '1rem', 
          border: 'none',
          borderRadius: '0.6rem',
          backgroundColor: 'transparent',
          marginLeft:'1rem',
          cursor: 'pointer',
          width: 'auto',
          height: 'fit-content',
          
          
        }}
        >{loading ? 'Fetching latest data from api...' : 'Latest data loaded!'}</h1>
  </div>
    
  
  );
}

export function HUDloading() {
  const [theme, setTheme] = useState('dark');
  const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (typeof window !== 'undefined' && window.globalTheme && window.loadedAPI){
        setTheme(window.globalTheme);
        setLoading(window.loadedAPI);
      }
  
      const handleThemeChange = () => {
        setTheme(window.globalTheme); // update local state
      };
      const handleLoadingText = () => {
        setLoading(window.loadedAPI); // update local state
      };
  
      window.addEventListener('themechange', handleThemeChange);
      window.addEventListener('dataloaded', handleLoadingText);

       return () => {
        window.removeEventListener('themechange', handleThemeChange);
        window.removeEventListener('dataloaded', handleLoadingText);
      };
    }, []);

  return <LoginBox theme={theme} loading={loading}/>;
}