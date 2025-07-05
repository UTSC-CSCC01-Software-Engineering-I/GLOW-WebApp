"use client";

import React, { useState, useEffect } from 'react';

export function HUDunitToggle() {
  const [unit, setUnit] = useState('C');

  useEffect(() => {
    window.temperatureUnit = unit;
  }, [unit]);

  const toggle = () => {
    const next = unit === 'C' ? 'F' : 'C';
    setUnit(next);
    window.temperatureUnit = next;
    window.dispatchEvent(new Event('unitchange'));
  };

  return (
    <button
      onClick={toggle}
      style={{
        position: 'fixed',
        top: '50%',                   // move to vertical center
        right: '1rem',
        transform: 'translateY(-50%)',// adjust centering
        zIndex: 1000,
        padding: '0.5rem 1rem',
        background: '#000',
        cursor: 'pointer',
        borderRadius: '0.25rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}
      onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0, 217, 255, 0.6)'}
      onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'}
    >
      °{unit}
    </button>
  );
}