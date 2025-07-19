"use client";

import React, { useEffect, useState } from 'react';
import '../styles/HudBeaches.css';
import { globalBeach } from './MapComponent.jsx';
import '../styles/homepage.css';



function LogoBlock() {
  const [theme, setTheme] = useState('light');
  const [locaList, setLocaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredList, setFilteredList] = useState([]);


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
    const checkForData = () => {
      console.log('🔍 HUD checking for data...', { globalBeach, hasItems: globalBeach?.items?.length });
      
      if (globalBeach && globalBeach.items) {
        console.log('✅ HUD found data:', globalBeach.items.length, 'items');
        setLocaList(globalBeach.items);
        setFilteredList(globalBeach.items);
        setLoading(false);
      } else if (window.loadedAPI === false) { // Map finished loading
        console.log('⚠️ Map finished loading but no data found');
        setLoading(false);
      }
    };

    // Check immediately
    checkForData();
    
    // Listen for data loaded event from MapComponent (fires for both cache and fresh data)
    const handleDataLoaded = () => {
      console.log('📡 HUD received dataloaded event');
      checkForData();
    };
    
    window.addEventListener('dataloaded', handleDataLoaded);
    
    return () => window.removeEventListener('dataloaded', handleDataLoaded);
  }, []);

  // Search functionality
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length === 0) {
      setFilteredList(locaList);
      return;
    }
    
    const lower = value.toLowerCase();
    const allNames = locaList.map(item => item.siteName);
    const filtered = allNames.filter(name => name.toLowerCase().includes(lower));
  
    // Filter the displayed list
    const filteredItems = locaList.filter(item => 
      item.siteName.toLowerCase().includes(lower)
    );
    setFilteredList(filteredItems);
  };

  const handleBeachClick = (name) => {
    // Also trigger map search if the function exists
    if (window.handleMapSearch) {
      window.handleMapSearch(name.siteName);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setFilteredList(locaList);
    setSuggestions([]);
    setShowSuggestions(false);
  };
    
  return (
    <div 
    className='boxwithpoints'
    style={{ 
      backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.85)': 'rgba(15, 15, 15, 0.85)', 
      border: theme === 'light' ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: theme === 'light' ? '0 8px 32px rgba(0, 0, 0, 0.1)' : '0 8px 32px rgba(0, 0, 0, 0.3)',
      display: 'flex',
      flexDirection: 'column',
      maxHeight: window.innerWidth <= 768 ? '80vh' : 'auto',
      overflow: 'hidden'
    }}>
        <h1 style={{ 
          color: theme === 'dark' ? 'rgb(255, 255, 255)': 'rgb(40, 40, 40)',
          fontSize: '1.75rem',
          fontWeight: '700',
          marginBottom: '1rem',
          marginTop: '0',
          letterSpacing: '-0.02em',
          flexShrink: 0
        }}>Beaches</h1>
        
        {/* Search Bar */}
        <div style={{ 
          position: 'relative', 
          marginBottom: '1.5rem',
          flexShrink: 0
        }}>
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => { if (searchTerm) setShowSuggestions(true); }}
            placeholder="Search beaches..."
            style={{
              width: '100%',
              padding: '0.75rem 2.5rem 0.75rem 1rem',
              borderRadius: '0.5rem',
              border: theme === 'light' ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(255, 255, 255, 0.2)',
              backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.1)',
              color: theme === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(40, 40, 40)',
              fontSize: '0.9rem',
              outline: 'none',
              backdropFilter: 'blur(10px)',
              boxSizing: 'border-box'
            }}
          />
          
          {/* Clear/Search Icon */}
          {searchTerm ? (
            <button
              onClick={clearSearch}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                fontSize: '1.2rem'
              }}
            >
              ✕
            </button>
          ) : (
            <div style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: theme === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
              fontSize: '1rem'
            }}>
              🔍
            </div>
          )}
        </div>
        
        {/* Scrollable beaches container */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE/Edge
          paddingRight: '2px' // Small padding to prevent content cutoff
        }}>
          {/* Hide scrollbar for webkit browsers */}
          <style dangerouslySetInnerHTML={{
            __html: `
              .boxwithpoints div::-webkit-scrollbar {
                display: none;
              }
            `
          }} />
        {filteredList.map((item, index) => (
          <div 
          key={index}
          onClick={() => handleBeachClick(item)}
          className="beach-item-hover"
          style={{ 
            cursor: 'pointer',
            backdropFilter: 'blur(10px)', 
            backgroundColor: theme === 'dark' ? 'rgba(25, 25, 25, 0.8)': 'rgba(255, 255, 255, 0.6)',
            borderRadius: '0.75rem', 
            padding: '1rem', 
            marginBottom: '0.75rem', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            border: theme === 'light' ? '1px solid rgba(255, 255, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: theme === 'light' ? '0 2px 12px rgba(0, 0, 0, 0.05)' : '0 2px 12px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            transform: 'translateY(0)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
          e.currentTarget.style.boxShadow = theme === 'light' 
            ? '0 8px 25px rgba(0, 0, 0, 0.12), 0 4px 10px rgba(0, 0, 0, 0.08)' 
            : '0 8px 25px rgba(0, 0, 0, 0.4), 0 4px 10px rgba(0, 0, 0, 0.3)';
          e.currentTarget.style.backgroundColor = theme === 'dark' 
            ? 'rgba(35, 35, 35, 0.9)' 
            : 'rgba(255, 255, 255, 0.8)';
          e.currentTarget.style.border = theme === 'light' 
            ? '1px solid rgba(255, 255, 255, 0.6)' 
            : '1px solid rgba(255, 255, 255, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = theme === 'light' 
            ? '0 2px 12px rgba(0, 0, 0, 0.05)' 
            : '0 2px 12px rgba(0, 0, 0, 0.2)';
          e.currentTarget.style.backgroundColor = theme === 'dark' 
            ? 'rgba(25, 25, 25, 0.8)' 
            : 'rgba(255, 255, 255, 0.6)';
          e.currentTarget.style.border = theme === 'light' 
            ? '1px solid rgba(255, 255, 255, 0.4)' 
            : '1px solid rgba(255, 255, 255, 0.08)';
        }}>
          <h2 style={{ 
            width: '60%', 
            fontWeight: '500', 
            fontSize: '1rem',
            color: theme === 'dark' ? 'rgb(240, 240, 240)': 'rgb(60, 60, 60)',
            margin: '0',
            lineHeight: '1.4',
            transition: 'color 0.3s ease'
          }}>{item.siteName}</h2>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            alignItems: 'baseline',
            gap: '0.25rem'
          }}>
            <h2 style={{ 
              fontSize:'2.25rem', 
              fontWeight: '700', 
              color: theme === 'dark' ? 'rgb(255, 255, 255)': 'rgb(30, 30, 30)',
              margin: '0',
              lineHeight: '1',
              transition: 'all 0.3s ease'
            }}>{item.temp}</h2>
            <h3 style={{ 
              fontSize:'1rem', 
              fontWeight: '500', 
              color: theme === 'dark' ? 'rgb(200, 200, 200)': 'rgb(100, 100, 100)',
              margin: '0',
              transition: 'color 0.3s ease'
            }}>°C</h3>
          </div>
          {/* <h2 style={{ color: theme === 'light' ? 'rgb(255 255 255 / 100%)': 'rgb(0 0 0 / 100%)'}}>Location: {item.}</h2> */}
        </div>
        ))}
        
        <div style={{ 
          color: loading ? '#ff9500' : (filteredList.length === 0 ? '#ff3b30': '#34c759'),
          fontSize: '0.875rem',
          fontWeight: '500',
          textAlign: 'center',
          marginTop: '1rem',
          padding: '0.75rem',
          backgroundColor: loading ? 'rgba(255, 149, 0, 0.1)' : (filteredList.length === 0 ? 'rgba(255, 59, 48, 0.1)': 'rgba(52, 199, 89, 0.1)'),
          borderRadius: '0.5rem',
          border: `1px solid ${loading ? 'rgba(255, 149, 0, 0.2)' : (filteredList.length === 0 ? 'rgba(255, 59, 48, 0.2)': 'rgba(52, 199, 89, 0.2)')}`,
          backdropFilter: 'blur(10px)',
          flexShrink: 0
        }}>
          {loading ? 'Loading beaches...' : 
           (filteredList.length === 0 ? 
            (searchTerm ? `No beaches found for "${searchTerm}"` : 'No beaches found') : 
            `${searchTerm ? 'Found' : 'Loaded'} ${filteredList.length} beach${filteredList.length !== 1 ? 'es' : ''}`
           )}
        </div>
        </div> {/* Close scrollable container */}
    </div>
  );
}


export function HUDleftPoints() {
  return <LogoBlock />;
}