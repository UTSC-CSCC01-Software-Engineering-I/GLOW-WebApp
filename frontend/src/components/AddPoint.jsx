"use client";

import React, { useEffect, useState } from 'react';

export default function AddPoint() {
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [temp, setTemp] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.globalTheme) {
      setTheme(window.globalTheme);
    }

    const handleThemeChange = () => setTheme(window.globalTheme);
    window.addEventListener('themechange', handleThemeChange);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude.toFixed(6));
          setLon(pos.coords.longitude.toFixed(6));
        },
        () => setError('Could not retrieve location')
      );
    }

    return () => window.removeEventListener('themechange', handleThemeChange);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    try {
      const token = localStorage.getItem('authToken'); // Get stored token
  
      if (!token) {
        setError('You must be logged in to add a point.');
        return;
      }
  
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/add-point`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Attach token here
        },
        body: JSON.stringify({
          lat: parseFloat(lat),
          lon: parseFloat(lon),
          temp: parseFloat(temp)
        }),
      });
  
      if (res.ok) {
        setSuccess(true);
        setTemp('');
      } else {
        const errorData = await res.json();
        setError(errorData.message || 'Failed to add point');
      }
    } catch (err) {
      setError('Error connecting to server');
    }
  };
  
  const isDark = theme === 'dark';
  const bg = isDark ? '#000' : '#fff';
  const fg = isDark ? '#fff' : '#000';
  const border = isDark ? '#444' : '#ccc';

  return (
    <div style={{
      padding: '6rem 1rem',
      minHeight: '100vh',
      backgroundColor: bg,
      color: fg,
      fontFamily: 'Inter, sans-serif',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
    }}>
      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        width: '100%',
        maxWidth: '400px',
        backgroundColor: isDark ? '#111' : '#f9f9f9',
        padding: '2rem',
        borderRadius: '0.75rem',
        border: `1px solid ${border}`,
        boxShadow: isDark ? '0 0 10px rgba(0,255,255,0.1)' : '0 0 10px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>Add New Point</h2>

        <label>
          Latitude:
          <input
            type="number"
            value={lat}
            onChange={e => setLat(e.target.value)}
            required
            style={inputStyle(fg, bg, border)}
          />
        </label>

        <label>
          Longitude:
          <input
            type="number"
            value={lon}
            onChange={e => setLon(e.target.value)}
            required
            style={inputStyle(fg, bg, border)}
          />
        </label>

        <label>
          Temperature (°C):
          <input
            type="number"
            value={temp}
            onChange={e => setTemp(e.target.value)}
            required
            style={inputStyle(fg, bg, border)}
          />
        </label>

        <button type="submit" style={{
          padding: '0.75rem',
          borderRadius: '0.5rem',
          border: 'none',
          fontWeight: 'bold',
          fontSize: '1rem',
          cursor: 'pointer',
          backgroundColor: isDark ? '#00d9ff' : '#007acc',
          color: '#000',
          transition: 'background-color 0.2s ease',
        }}>
          Submit
        </button>

        {success && <p style={{ color: 'lime' }}>✅ Point added!</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
}

function inputStyle(fg, bg, border) {
  return {
    marginTop: '0.25rem',
    padding: '0.5rem',
    borderRadius: '0.4rem',
    backgroundColor: bg,
    color: fg,
    border: `1px solid ${border}`,
    width: '100%',
    fontSize: '1rem',
  };
}
