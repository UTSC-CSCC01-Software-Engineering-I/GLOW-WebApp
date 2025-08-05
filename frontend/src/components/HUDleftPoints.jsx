"use client";

import React, { useEffect, useState, useRef } from 'react';
import '../styles/HudBeaches.css';
import { globalBeach } from './MapComponent.jsx';
import '../styles/homepage.css';
import TempFilterModal from './TempFilterModal';
import { ThemeManager } from '../utils/themeManager';

const formatTemperature = (tempC, unit) => {
  if (unit === 'F') {
    return ((tempC * 9/5) + 32).toFixed(1);
  }
  return parseFloat(tempC).toFixed(1);
};

function LogoBlock() {
  const [theme, setTheme] = useState(() => ThemeManager.getTheme());
  const [locaList, setLocaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredList, setFilteredList] = useState([]);
  const [sortOrder, setSortOrder] = useState(null);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [unit, setUnit] = useState('C');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tempFilter, setTempFilter] = useState({
    min: '', max: '',
    distanceMin: '', distanceMax: '',
    maxAge: ''
  });
  
  // Add new state for user location
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  const sortWrapperRef = useRef(null);

  useEffect(() => {
    // Initialize theme using ThemeManager
    const currentTheme = ThemeManager.getTheme();
    setTheme(currentTheme);

    // Listen for theme changes
    const removeListener = ThemeManager.addThemeChangeListener((newTheme) => {
      setTheme(newTheme);
    });

    return removeListener;
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

  // Sort functionality
  useEffect(() => {
    if (!sortOrder) return;
    
    setFilteredList(list => {
      const sorted = [...list].sort((a, b) => {
        switch (sortOrder) {
          case 'temp-asc':
            return a.temp - b.temp;
          case 'temp-desc':
            return b.temp - a.temp;
          case 'time-newest':
            // Handle different timestamp formats
            const getTimestamp = (item) => {
              if (item.updatedAt) return new Date(item.updatedAt);
              if (item.createdAt) return new Date(item.createdAt);
              if (item.timestamp) {
                const formatted = item.timestamp.replace ? item.timestamp.replace(' ', 'T') : item.timestamp;
                return new Date(formatted);
              }
              return new Date(0); // Fallback to epoch
            };
            return getTimestamp(b) - getTimestamp(a);
          case 'time-oldest':
            const getTimestampOld = (item) => {
              if (item.updatedAt) return new Date(item.updatedAt);
              if (item.createdAt) return new Date(item.createdAt);
              if (item.timestamp) {
                const formatted = item.timestamp.replace ? item.timestamp.replace(' ', 'T') : item.timestamp;
                return new Date(formatted);
              }
              return new Date(0);
            };
            return getTimestampOld(a) - getTimestampOld(b);
          case 'distance':
            if (!userLocation) return 0;
            const distanceA = calculateDistance(
              userLocation.lat, userLocation.lng,
              a.lat || a.Latitude, a.lng || a.lon || a.Longitude
            );
            const distanceB = calculateDistance(
              userLocation.lat, userLocation.lng,
              b.lat || b.Latitude, b.lng || b.lon || b.Longitude
            );
            return distanceA - distanceB;
          default:
            return 0;
        }
      });
      return sorted;
    });
  }, [sortOrder, userLocation]);

  const handleSortTempAsc = () => {
    setSortOrder('temp-asc');
    setShowSortMenu(false);
  };

  const handleSortTempDesc = () => {
    setSortOrder('temp-desc');
    setShowSortMenu(false);
  };

  const handleSortTimeNewest = () => {
    setSortOrder('time-newest');
    setShowSortMenu(false);
  };

  const handleSortTimeOldest = () => {
    setSortOrder('time-oldest');
    setShowSortMenu(false);
  };

  const handleSortDistance = () => {
    if (!userLocation) {
      alert('Location access is required for distance sorting. Please enable location permissions and refresh the page.');
      return;
    }
    setSortOrder('distance');
    setShowSortMenu(false);
  };

  const handleSortReset = () => {
    setSortOrder(null);
    setFilteredList(locaList);
    setShowSortMenu(false);
  };

  // Function to get sort status text
  const getSortStatusText = () => {
    switch (sortOrder) {
      case 'temp-asc': return 'Sorted by temperature (low to high)';
      case 'temp-desc': return 'Sorted by temperature (high to low)';
      case 'time-newest': return 'Sorted by newest updates';
      case 'time-oldest': return 'Sorted by oldest updates';
      case 'distance': return 'Sorted by distance (nearest first)';
      default: return '';
    }
  };

  useEffect(() => {
    // Get user location on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          console.log('🗺️ User location obtained:', position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn('📍 Location access denied or failed:', error.message);
          setLocationError(error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      setLocationError('Geolocation not supported');
    }
  }, []);

  // Function to calculate distance between two points using Haversine formula
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  };

  // Search functionality
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length === 0) {
      setFilteredList(locaList);
      return;
    }
    
    const lower = value.toLowerCase();

    // make sure siteName is never undefined here:
    const allNames = locaList.map(item => item.siteName || '');
    const filtered = allNames.filter(name =>
      name.toLowerCase().includes(lower)
    );
  
    // Filter the displayed list
    const filteredItems = locaList.filter(item =>
      (item.siteName || '').toLowerCase().includes(lower)
    );
    setFilteredList(filteredItems);
  };

  const handleBeachClick = (item) => {
    // Also trigger map search if the function exists
    if (window.handleMapSearch) {
      // Get the exact coordinates, ensuring we're using the right property names
      const lat = item.lat || item.Latitude;
      const lon = item.lng || item.lon || item.Longitude;
      
      // Get a name for the search
      const searchIdentifier = item.siteName || 
                            (item.isUserPoint ? `User Point (${lat},${lon})` : 'Unknown Point');
      
      // ALWAYS force popup to open with true parameter
      window.handleMapSearch(searchIdentifier, lat, lon, true);
      
      console.log(`Clicked point: ${searchIdentifier} at ${lat},${lon}`);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setFilteredList(locaList);
    setSuggestions([]);
    setShowSuggestions(false);
  };
    
  // Update the useEffect that handles unit changes
  useEffect(() => {
    const handleUnitChange = () => {
      // Check if window exists before accessing it
      if (typeof window !== 'undefined') {
        setUnit(window.temperatureUnit || 'C');
      }
    };
    
    // Initialize on mount
    handleUnitChange();
    
    // Add event listener
    if (typeof window !== 'undefined') {
      window.addEventListener('unitchange', handleUnitChange);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('unitchange', handleUnitChange);
      }
    };
  }, []);

  // close sort menu when clicking outside
  useEffect(() => {
    if (!showSortMenu) return;
    const handleClickOutside = e => {
      if (sortWrapperRef.current && !sortWrapperRef.current.contains(e.target)) {
        setShowSortMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSortMenu]);

  // NEW: dispatch filterchange event
  const handleApplyFilter = () => {
    const min      = parseFloat(tempFilter.min);
    const max      = parseFloat(tempFilter.max);
    const distanceMax = parseFloat(tempFilter.distanceMax);
    const maxAge   = parseFloat(tempFilter.maxAge);
    window.dispatchEvent(new CustomEvent('filterchange', {
      detail: {
        min:        isNaN(min)        ? NaN : min,
        max:        isNaN(max)        ? NaN : max,
        distanceMax:isNaN(distanceMax)? NaN : distanceMax,
        maxAge:     isNaN(maxAge)     ? NaN : maxAge
      }
    }));
    setShowFilterModal(false);
  };

  // NEW: reset filter AND dispatch
  const handleResetFilter = () => {
    setTempFilter({ min:'', max:'', distanceMax:'', maxAge:'' });
    window.dispatchEvent(new CustomEvent('filterchange', {
      detail: {
        min: NaN, max: NaN,
        distanceMax: NaN,
        maxAge: NaN
      }
    }));
    setShowFilterModal(false);
  };

  // Listen for filterchange events and update the side‐panel list
  useEffect(() => {
    function handleFilterChange(e) {
      const { min, max, distanceMax, maxAge } = e.detail;
      const now = Date.now();
      setFilteredList(locaList.filter(item => {
        const tempOK = (isNaN(min) || item.temp >= min) &&
                       (isNaN(max) || item.temp <= max);

        let distOK = true;
        if (!isNaN(distanceMax) && userLocation) {
          const d = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            item.lat, item.lng || item.lon
          );
          if (d > distanceMax) distOK = false;
        }

        let ageOK = true;
        if (!isNaN(maxAge) && item.timestamp) {
          const ageDays = (now - new Date(item.timestamp).getTime())
                            / (1000*60*60*24);
          if (ageDays > maxAge) ageOK = false;
        }

        return tempOK && distOK && ageOK;
      }));
    }
    window.addEventListener('filterchange', handleFilterChange);
    return () => window.removeEventListener('filterchange', handleFilterChange);
  }, [locaList, userLocation]);

  return (
    <div 
      className="boxwithpoints"
      style={{
        // backgroundColor: theme === 'light' ? '#ffffff44' : '#ffffff44',
        border: theme === 'light'
          ? '1px solid rgba(255,255,255,0.3)'
          : '1px solid rgba(255,255,255,0.1)',
        boxShadow: theme === 'light'
          ? '0 8px 32px rgba(0,0,0,0.1)'
          : '0 8px 32px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      <h1 style={{ 
        color: theme === 'dark' ? 'rgb(255, 255, 255)': 'rgb(40, 40, 40)',
        fontSize: '1.75rem',
        fontWeight: '700',
        marginBottom: '1rem',
        marginTop: '0',
        letterSpacing: '-0.02em',
        flexShrink: 0
      }}>Beaches</h1>
      
      {/* Search + Sort Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
        flexShrink: 0
      }}>
        {/* Search bar */}
        <div style={{ position: 'relative', flex: 1, marginRight: '0.5rem' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            placeholder="search"
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
        
        {/* Enhanced Sort dropdown trigger */}
        <div style={{ position: 'relative' }} ref={sortWrapperRef}>
          <button
            onClick={() => setShowSortMenu(v => !v)}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = theme === 'light' ? '#f0f0f0' : '#444'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = theme === 'light' ? '#fff' : '#333'}
            style={{
              padding: '0.5rem',
              borderRadius: '0.25rem',
              border: '1px solid rgba(0,0,0,0.1)',
              backgroundColor: theme === 'light' ? '#fff' : '#333',
              color: theme === 'light' ? '#000' : '#fff',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            {sortOrder ? '⚡' : '↕'}
          </button>
          
          {showSortMenu && (
            <div 
              className="sort-menu"
              style={{
              position: 'absolute',
              top: 'calc(100% + 0.25rem)',
              right: 0,
              backgroundColor: theme === 'light' ? '#dadadae1' : '#242424f1',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              
              height: '20vh',
              
              color: theme === 'light' ? '#000' : '#fff',
              borderRadius: '1rem',
              overflow: 'hidden',
              overflowY: 'scroll',
              zIndex: 10,
              width: '12rem',
              backdropFilter: 'blur(10px)',
              border: theme === 'light'
                ? '1px solid rgba(255,255,255,0.3)'
                : '1px solid rgba(255,255,255,0.1)',
              scrollbarWidth: 'thin',
              scrollbarColor: theme === 'light' 
                ? 'rgba(0,0,0,0.3) rgba(0,0,0,0.1)' 
                : 'rgba(255,255,255,0.3) rgba(255,255,255,0.1)'
            }}>
              {/* Temperature sorting */}
              <div style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: '600', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                Temperature
              </div>
              <button
                onClick={handleSortTempAsc}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = theme === 'light' ? '#f0f0f0' : '#444'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  background: 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  color: theme === 'light' ? '#000' : '#fff'
                }}
              >
                🌡 Low to High
              </button>
              <button
                onClick={handleSortTempDesc}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = theme === 'light' ? '#f0f0f0' : '#444'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  background: 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  color: theme === 'light' ? '#000' : '#fff'
                }}
              >
                🌡 High to Low
              </button>

              {/* Time sorting */}
              <div style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: '600', borderBottom: '1px solid rgba(255,255,255,0.1)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                Last Updated
              </div>
              <button
                onClick={handleSortTimeNewest}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = theme === 'light' ? '#f0f0f0' : '#444'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  background: 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  color: theme === 'light' ? '#000' : '#fff'
                }}
              >
                ⏱ Newest First
              </button>
              <button
                onClick={handleSortTimeOldest}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = theme === 'light' ? '#f0f0f0' : '#444'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  background: 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  color: theme === 'light' ? '#000' : '#fff'
                }}
              >
                ⏱ Oldest First
              </button>

              {/* Distance sorting */}
              <div style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: '600', borderBottom: '1px solid rgba(255,255,255,0.1)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                Location
              </div>
              <button
                onClick={handleSortDistance}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = theme === 'light' ? '#f0f0f0' : '#444'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  background: 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  color: theme === 'light' ? '#000' : '#fff',
                  opacity: userLocation ? 1 : 0.5
                }}
                disabled={!userLocation}
              >
                ⚲ Nearest First
                {!userLocation && <span style={{ fontSize: '0.7rem', display: 'block' }}>
                  {locationError ? '(Location denied)' : '(Getting location...)'}
                </span>}
              </button>

              {/* Reset option */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <button
                  onClick={handleSortReset}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = theme === 'light' ? '#f0f0f0' : '#444'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.5rem 1rem',
                    border: 'none',
                    background: 'transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: theme === 'light' ? '#000' : '#fff'
                  }}
                >
                  ⟳ Reset Sort
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Filter button */}
        <button
          onClick={() => setShowFilterModal(true)}
          style={{
            marginLeft: '0.5rem',
            padding: '0.5rem',
            borderRadius: '0.25rem',
            border: '1px solid rgba(0,0,0,0.1)',
            backgroundColor: theme === 'light' ? '#fff' : '#333',
            color: theme === 'light' ? '#000' : '#fff',
            cursor: 'pointer'
          }}
        >
          ⋮
        </button>
      </div>

      {/* Add sort status indicator */}
      {sortOrder && (
        <div style={{
          fontSize: '0.75rem',
          color: theme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
          marginBottom: '0.5rem',
          padding: '0.25rem 0.5rem',
          backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
          borderRadius: '0.25rem',
          textAlign: 'center'
        }}>
          {getSortStatusText()}
        </div>
      )}

      {/* Scrollable beaches container */}
      <div style={{
        flex: 1,
        overflowY: 'scroll',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        paddingRight: '2px'
      }}>
        {/* Hide scrollbar for webkit browsers */}
        <style dangerouslySetInnerHTML={{
          __html: `
            .boxwithpoints div::-webkit-scrollbar {
              display: none;
            }
            .sort-menu::-webkit-scrollbar {
              width: 8px;
            }
            .sort-menu::-webkit-scrollbar-track {
              background: ${theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'};
              border-radius: 10px;
            }
            .sort-menu::-webkit-scrollbar-thumb {
              background: ${theme === 'light' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)'};
              border-radius: 10px;
            }
            .sort-menu::-webkit-scrollbar-thumb:hover {
              background: ${theme === 'light' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)'};
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
            backgroundColor: theme === 'dark' 
              ? 'rgba(25, 25, 25, 0.8)' 
              : 'rgba(255, 255, 255, 0.6)',
            borderRadius: '0.75rem',
            padding: '1rem',
            marginBottom: '0.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            border: theme === 'light'
              ? '1px solid rgba(255,255,255,0.4)'
              : '1px solid rgba(255,255,255,0.08)',
            boxShadow: theme === 'light'
              ? '0 2px 12px rgba(0,0,0,0.05)'
              : '0 2px 12px rgba(0,0,0,0.2)',
            transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)'
          }}
          onMouseEnter={(e) => {
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
          {/* left column: name + timestamp */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            flex: 1
          }}>
            <h2 style={{
              margin: 0,
              fontWeight: 500,
              fontSize: '1rem',
              color: theme === 'dark' 
                ? 'rgb(240,240,240)' 
                : 'rgb(60,60,60)',
              lineHeight: 1.4,
              transition: 'color 0.3s ease'
            }}>
              {/* Display "User Point" for user-generated points, otherwise use siteName */}
              {item.isUserPoint ? 'User Point' : (item.siteName || 'User Point')}
            </h2>
            <p style={{
              fontSize: '0.75rem',
              margin: 0,
              color: theme === 'dark'
                ? 'rgba(255,255,255,0.6)'
                : 'rgba(0,0,0,0.6)'
            }}>
              { item.timestamp || item.updatedAt || item.createdAt
                ? (() => {
                    // More detailed debugging for user points
                    if (!item.siteName) {
                      console.log('USER POINT DATA:', item);
                      console.log('updatedAt type:', typeof item.updatedAt);
                      console.log('updatedAt value:', item.updatedAt);
                      console.log('createdAt value:', item.createdAt);
                      
                      // Check if updatedAt is nested inside another object
                      if (item.metadata) console.log('metadata:', item.metadata);
                    }
                    
                    // Handle different timestamp formats
                    let date;
                    try {
                      if (item.updatedAt) {
                        // For user points
                        date = new Date(item.updatedAt);
                        console.log('Parsed updatedAt date:', date, 'Is valid:', !isNaN(date.getTime()));
                      } else if (item.createdAt) {
                        // Try createdAt if updatedAt isn't available
                        date = new Date(item.createdAt);
                        console.log('Parsed createdAt date:', date, 'Is valid:', !isNaN(date.getTime()));
                      } else if (item.timestamp) {
                        // For official data
                        const formattedTimestamp = item.timestamp.replace ? item.timestamp.replace(' ', 'T') : item.timestamp;
                        date = new Date(formattedTimestamp);
                        console.log('Parsed timestamp date:', date, 'Is valid:', !isNaN(date.getTime()));
                      } else {
                        console.log('No valid timestamp found');
                        return '—';
                      }
                      
                      // Check if the date is valid
                      if (isNaN(date.getTime())) {
                        console.log('Date is invalid');
                        return '—';
                      }
                      
                      return date.toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                    } catch (error) {
                      console.error('Error parsing date:', error);
                      return '—';
                    }
                  })()
                : '—' }
            </p>
          </div>

          {/* right column: temperature */}
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '0.25rem'
          }}>
            <h2 style={{
              fontSize: '2.25rem',
              fontWeight: 700,
              color: theme === 'dark' 
                ? 'rgb(255,255,255)' 
                : 'rgb(30,30,30)',
              margin: 0,
              lineHeight: 1,
              transition: 'all 0.3s ease'
            }}>
              {unit === 'F'
                ? ((item.temp * 9/5) + 32).toFixed(1)
                : item.temp}
            </h2>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 500,
              color: theme === 'dark' 
                ? 'rgb(200,200,200)' 
                : 'rgb(100,100,100)',
              margin: 0,
              transition: 'color 0.3s ease'
            }}>
              °{unit}
            </h3>
          </div>
        </div>
      ))}
      
      {/* Status message */}
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

    {/* 2) Full-screen FILTER modal - render outside the component using portal */}
    <TempFilterModal
        show={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        theme={theme}
        tempFilter={tempFilter}
        setTempFilter={setTempFilter}
        applyTempFilter={handleApplyFilter}    // use handler
        resetTempFilter={handleResetFilter}    // use handler
      />
    </div>
  );
}


export function HUDleftPoints() {
  return <LogoBlock />;
}