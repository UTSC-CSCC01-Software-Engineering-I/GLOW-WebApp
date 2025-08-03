"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeManager } from '../utils/themeManager';

function LoginBox({ toggleTheme, theme, loggedIn }) {
  const router = useRouter();
  if (!loggedIn) {
    return (
      <div className='top-right-hud' >
        <div style={{ backgroundColor: theme === 'light' ? 'rgb(255, 255, 255)': 'black', width: '2.5rem', height: '2.5rem', top: '1.2rem',
        right: '4.2rem', position: 'fixed', borderRadius: '4rem', display: 'flex'}}>
            <button onClick={toggleTheme} style={{ 
                    color: theme === 'dark' ? 'yellow': 'black',
                    fontFamily: 'LEMONMILK, sans-serif', 
                    fontWeight: '900', 
                    fontSize: '10rem', 
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
        
      <div style={{ backgroundColor: theme === 'light' ? 'white': 'black', width: '10rem', height: '3rem', top: '1rem',
        right: '7.2rem', position: 'fixed', borderRadius: '0.6rem', display: 'flex', 
        alignItems: 'center', justifyContent: 'center', flexDirection: 'row-reverse'}}>
          
          <button onClick={() => router.push('/default')} style={{ 
            color: theme === 'dark' ? 'white': 'black', 
            fontFamily: 'LEMONMILK', 
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
          >Login/Sign up</button>
          
          
      </div>
    </div>
      
    
    );
  } else {
    return (
      <div className='top-right-hud' >
        <div style={{ backgroundColor: theme === 'light' ? 'rgb(255, 255, 255)': 'black', width: '2.5rem', height: '2.5rem', top: '1.2rem',
        right: '4.2rem', position: 'fixed', borderRadius: '4rem', display: 'flex'}}>
            <button onClick={toggleTheme} style={{ 
                    color: theme === 'dark' ? 'yellow': 'black',
                    fontFamily: 'LEMONMILK, sans-serif', 
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
        
      <div style={{ backgroundColor: theme === 'dark' 
              ? 'rgba(25, 25, 25, 1)' 
              : 'rgba(255, 255, 255, 1)', width: '9rem', height: '3rem', top: '1rem',
        right: '7.2rem', position: 'fixed', borderRadius: '0.6rem', display: 'flex', 
        alignItems: 'center', justifyContent: 'center', flexDirection: 'row-reverse'}}>
          
          <button onClick={() => router.push('/dashboard')} style={{ 
            color: theme === 'dark' ? 'white': 'black', 
            fontFamily: 'LEMONMILK', 
            fontWeight: '400', 
            fontSize: '1rem', 
            border: 'none',
            borderRadius: '0.6rem',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            width: '100%',
            height: '100%'
            
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(90, 90, 90, 1)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >Dashboard</button>
          
          
      </div>
    </div>
      
    
    );
  }
}

export function HUDlogin() {
  const [theme, setTheme] = useState(() => ThemeManager.getTheme());
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setLoggedIn(!!token); // Update loggedIn state based on token existence
    
    // Initialize theme using ThemeManager
    const currentTheme = ThemeManager.getTheme();
    setTheme(currentTheme);

    // Listen for theme changes
    const removeListener = ThemeManager.addThemeChangeListener((newTheme) => {
      setTheme(newTheme);
    });

    return removeListener;
  }, []);

  const toggleTheme = () => {
    console.log('Toggle theme clicked!'); // Debug log
    console.log('current login state:', loggedIn); // Debug log
    
    const newTheme = theme === 'light' ? 'dark' : 'light';
    
    // Use ThemeManager to update theme globally
    // The map will automatically switch layers via its own theme listener
    ThemeManager.setTheme(newTheme);
  };

  return <LoginBox toggleTheme={toggleTheme} theme={theme} loggedIn={loggedIn}/>;
}
