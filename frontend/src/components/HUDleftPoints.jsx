"use client";

import React, { useEffect, useState } from 'react';
import '../styles/HudBeaches.css';



function LogoBlock() {
  const [theme, setTheme] = useState('light');
  const [locaList, setLocaList] = useState([]);
  const [loading, setLoading] = useState(true);


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

    useEffect(() => {
      async function gettempData() {
        try {
          setLoading(true);
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/water-data`);
          const data = await response.json();
          console.log('Got data →', data);
          
          if (data && data.items) {
            setLocaList(data.items);
          } else {
            console.log('No items found in response');
            setLocaList([]);
          }
        } catch (err) {
          console.error('fetch error →', err);
          setLocaList([]);
        } finally {
          setLoading(false);
        }
      }

      gettempData();
    }, []);
    
  return (
  
    <div className='top-left-hud'>
    <div style={{ backgroundColor: theme === 'light' ? 'rgb(255 255 255 / 48%)': 'rgb(0 0 0 / 38%)', width: '18rem', height: '80vh', top: '4.5rem',
      left: '1rem', position: 'fixed', borderRadius: '0.6rem', 
      display: 'flex', justifyContent: 'center', padding: '1rem 0.5rem 1rem 1rem ', flexDirection: 'column', justifyContent: 'flex-start',
      overflow: 'hidden', scrollBehavior: 'smooth', overflowY: 'scroll', backdropFilter: 'blur(3px)'}}>
        <h1 style={{ color: theme === 'dark' ? 'rgb(255 255 255 / 100%)': 'rgb(0 0 0 / 100%)'}}>Beaches</h1>
        {locaList.map((item, index) => (
          <div 
          key={index}
          style={{ backdropFilter: 'blur(40px)', backgroundColor: theme === 'dark' ? '#000000': 'rgb(0 0 0 / 10%)', width: '100%',
          borderRadius: '10px', padding: '0.6rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <h2 style={{ width: '60%', fontWeight: '100', color: theme === 'dark' ? 'rgb(255 255 255 / 100%)': 'rgb(0 0 0 / 100%)'}}>{item.siteName}</h2>
          <h2 style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' ,fontSize:'2rem', fontWeight: '600', color: theme === 'dark' ? 'rgb(255 255 255 / 100%)': 'rgb(0 0 0 / 100%)'}}>{item.temp}
            <h3 style={{ fontSize:'1rem', fontWeight: '600', color: theme === 'dark' ? 'rgb(255 255 255 / 100%)': 'rgb(0 0 0 / 100%)'}}>° C</h3>
          </h2>
          {/* <h2 style={{ color: theme === 'light' ? 'rgb(255 255 255 / 100%)': 'rgb(0 0 0 / 100%)'}}>Location: {item.}</h2> */}
        </div>
        ))}
        <div style={{ color: loading ? 'orange' : (locaList.length === 0 ? 'red': 'green')}}>
          {loading ? 'Loading beaches...' : (locaList.length === 0 ? 'No beaches found' : `Loaded ${locaList.length} beaches`)}
        </div>
    </div>
  </div>
  );
}


export function HUDleftPoints() {
  return <LogoBlock />;
}