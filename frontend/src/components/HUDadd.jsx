"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeManager } from '../utils/themeManager';

function MenuBlock({ theme, loggedIn }) {
  const router = useRouter();

  const handleClick = () => {
    if (loggedIn) {
      router.push('/add-point');
    } else {
      router.push('/default');
    }
  };

  return (
    <div className='top-right-hud'>
      <div style={{
        backgroundColor: theme === 'dark' ? 'white' : 'black',
        width: '10rem',
        height: '2rem',
        top: '4.5rem',
        right: '1rem',
        position: 'fixed',
        borderRadius: '0.6rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'left',
        paddingLeft: '1rem',
        flexDirection: 'row'
      }}>
        <h1 style={{
          color: theme === 'light' ? 'white' : 'black',
          fontFamily: 'LEMONMILK, sans-serif',
          fontWeight: '900',
          fontSize: '2rem'
        }}>+</h1>
        <button
          onClick={handleClick}
          style={{
            color: theme === 'light' ? 'white' : 'black',
            fontFamily: 'LEMONMILK, sans-serif',
            fontWeight: '500',
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
        >
          Add Point
        </button>
      </div>
    </div>
  );
}

export function HUDadd() {
  const [theme, setTheme] = useState(() => ThemeManager.getTheme());
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setLoggedIn(!!token); // true if token exists

    // Initialize theme using ThemeManager
    const currentTheme = ThemeManager.getTheme();
    setTheme(currentTheme);

    // Listen for theme changes
    const removeListener = ThemeManager.addThemeChangeListener((newTheme) => {
      setTheme(newTheme);
    });

    return removeListener;
  }, []);

  return <MenuBlock theme={theme} loggedIn={loggedIn} />;
}
