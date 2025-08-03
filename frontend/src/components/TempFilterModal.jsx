import React from 'react';
import { createPortal } from 'react-dom';

function TempFilterModal({ 
  show, 
  onClose, 
  theme, 
  tempFilter, 
  setTempFilter, 
  applyTempFilter, 
  resetTempFilter 
}) {
  if (!show) return null;

  // Handler for overlay click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Use createPortal with a null check for document
  return typeof document !== 'undefined' ? createPortal(
    <div
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0,
        background: theme === 'light' 
          ? 'rgba(0,0,0,0.4)' 
          : 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999, 
        backdropFilter: 'blur(4 px)'
      }}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: theme === 'light'
            ? 'rgba(255,255,255,0.1)'
            : 'rgba(25,25,25,0.1)',
          color: theme === 'light' ? '#000' : '#fff',
          padding: '2rem',
          borderRadius: '1rem',
          minWidth: '320px',
          maxWidth: '400px',
          width: '90%',
          boxShadow: theme === 'light'
            ? '0 20px 60px rgba(0,0,0,0.15), 0 8px 20px rgba(0,0,0,0.1)'
            : '0 20px 60px rgba(0,0,0,0.6), 0 8px 20px rgba(0,0,0,0.4)',
          border: theme === 'light'
            ? '1px solid rgba(255,255,255,0.8)'
            : '1px solid rgba(255,255,255,0.2)',
          backdropFilter: 'blur(20px)'
        }}>
        <h2 style={{ 
          margin: '0 0 1.5rem', 
          fontSize: '1.5rem',
          fontWeight: '600',
          textAlign: 'center'
        }}>
          Filter
        </h2>
        
        <p style={{
          margin: '0 0 1rem',
          fontSize: '0.9rem',
          color: theme === 'light' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)',
          textAlign: 'center'
        }}>
          Filter beaches by temperature range (°C)
        </p>

        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginBottom: '2rem' 
        }}>
          <div style={{ flex: 1 }}>
            <label style={{
              display: 'block',
              fontSize: '0.85rem',
              fontWeight: '500',
              marginBottom: '0.5rem',
              color: theme === 'light' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)'
            }}>
              Minimum °C
            </label>
            <input
              type="number"
              placeholder="e.g. 15"
              value={tempFilter.min}
              onChange={e => setTempFilter(f => ({ ...f, min: e.target.value }))}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '0.5rem',
                border: theme === 'light'
                  ? '1px solid rgba(0,0,0,0.1)'
                  : '1px solid rgba(255,255,255,0.2)',
                backgroundColor: theme === 'light'
                  ? '#fff'
                  : 'rgba(255,255,255,0.1)',
                color: theme === 'light' ? '#000' : '#fff',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s ease',
                boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.borderColor = theme === 'light' ? '#007AFF' : '#0A84FF'}
              onBlur={e => e.target.style.borderColor = theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)'}
            />
          </div>
          
          <div style={{ flex: 1 }}>
            <label style={{
              display: 'block',
              fontSize: '0.85rem',
              fontWeight: '500',
              marginBottom: '0.5rem',
              color: theme === 'light' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)'
            }}>
              Maximum °C
            </label>
            <input
              type="number"
              placeholder="e.g. 25"
              value={tempFilter.max}
              onChange={e => setTempFilter(f => ({ ...f, max: e.target.value }))}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '0.5rem',
                border: theme === 'light'
                  ? '1px solid rgba(0,0,0,0.1)'
                  : '1px solid rgba(255,255,255,0.2)',
                backgroundColor: theme === 'light'
                  ? '#fff'
                  : 'rgba(255,255,255,0.1)',
                color: theme === 'light' ? '#000' : '#fff',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s ease',
                boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.borderColor = theme === 'light' ? '#007AFF' : '#0A84FF'}
              onBlur={e => e.target.style.borderColor = theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)'}
            />
          </div>
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.4rem 0.9rem',
              background: 'transparent',
              border: theme === 'light'
                ? '2px solid rgba(0,0,0,0.1)'
                : '2px solid rgba(255,255,255,0.2)',
              borderRadius: '0.35rem',
              color: theme === 'light' ? '#000' : '#fff',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => {
              e.target.style.backgroundColor = theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)';
              e.target.style.borderColor = theme === 'light' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.3)';
            }}
            onMouseLeave={e => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.borderColor = theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)';
            }}
          >
            Cancel
          </button>
          
          <button
            onClick={resetTempFilter}
            style={{
              padding: '0.4rem 0.9rem',
              background: 'transparent',
              border: theme === 'light'
                ? '2px solid rgba(0,0,0,0.1)'
                : '2px solid rgba(255,255,255,0.2)',
              borderRadius: '0.35rem',
              color: theme === 'light' ? '#000' : '#fff',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => {
              e.target.style.backgroundColor = theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)';
              e.target.style.borderColor = theme === 'light' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.3)';
            }}
            onMouseLeave={e => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.borderColor = theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)';
            }}
          >
            Reset
          </button>
          
          <button
            onClick={applyTempFilter}
            style={{
              width: '100%',
              padding: '0.4rem 0.9rem',
              backgroundColor: theme === 'light' ? '#34c759' : '#30D158',
              border: 'none',
              borderRadius: '0.35rem',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => e.target.style.backgroundColor = theme === 'light' ? '#28A745' : '#28A745'}
            onMouseLeave={e => e.target.style.backgroundColor = theme === 'light' ? '#34c759' : '#30D158'}
          >
            Apply Filter
          </button>
        </div>
      </div>
    </div>,
    document.body
  ) : null;
}

export default TempFilterModal;