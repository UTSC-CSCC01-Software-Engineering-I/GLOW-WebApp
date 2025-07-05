"use client";

import React, { useEffect, useState, useRef } from 'react';
import '../styles/MapView.css';

let globalBeach = null;

export default function MapComponent() {
  const mapRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);      // ← store { marker, tempC, name }

  // Temperature color function - works with both Celsius and Fahrenheit
  function getTemperatureColor(temp, unit = 'C') {
    // Convert to Celsius for consistent color mapping
    const tempC = unit === 'F' ? (temp - 32) * 5/9 : temp;
    
    if (tempC <= 0) {
      return '#634760'; // Bright purple for freezing
    } else if (tempC <= 7) {
      return '#12a8a8'; // Bright cyan for cold
    } else if (tempC <= 11) {
      return '#7cdd06'; // Bright lime green for cool
    } else if (tempC <= 16) {
      return '#fcfd0b'; // Bright yellow for mild
    } else if (tempC <= 20) {
      return '#f78e24'; // Bright orange for warm
    } else if (tempC <= 24) {
      return '#f31250'; // Bright pink for warmer
    } else {
      return '#920504'; // Bright red for hot
    }
  }

  useEffect(() => {
    window.loadedAPI = loading;
    window.dispatchEvent(new Event('dataloaded'));
  });

  useEffect(() => {
    // Only import Leaflet on the client side
    const initMap = async () => {
      if (mapInstanceRef.current) return;
      const L = (await import('leaflet')).default;
      
      // Add Leaflet CSS dynamically
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Define tile layers
      const lightURL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      const darkURL = 'https://api.maptiler.com/maps/streets-v2-dark/256/{z}/{x}/{y}.png?key=L5q2BtlaSVpbYdOmasce';

      const lightLayer = L.tileLayer(lightURL, {
        maxZoom: 19, 
        attribution: '© OpenStreetMap'
      });
      
      const darkLayer = L.tileLayer(darkURL, {
        maxZoom: 19, 
        attribution: '© MapTiler © OpenStreetMap contributors'
      });

      // Auto-detect initial theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // Initialize map only if container exists and map doesn't exist yet
      if (mapRef.current && !mapInstanceRef.current) {
        const map = L.map(mapRef.current, {
          center: [43.647216678117736, -79.36719310664458], // Toronto lakeshore
          zoom: 12,
          layers: [prefersDark ? darkLayer : lightLayer]
        });        // Store map instance for cleanup
        mapInstanceRef.current = map;

        // Store map and layers globally for HUD access
        window.leafletMap = map;
        window.lightLayer = lightLayer;
        window.darkLayer = darkLayer;

        // Add layer switcher
        // L.control.layers({
        //   'Light': lightLayer,
        //   'Dark': darkLayer 
        // }).addTo(map);

        // Listen for OS theme changes
        window.matchMedia('(prefers-color-scheme: dark)')
          .addEventListener('change', e => {
            if (e.matches) {
              map.removeLayer(lightLayer);
              map.addLayer(darkLayer);
            } else {
              map.removeLayer(darkLayer);
              map.addLayer(lightLayer);
            }
          });


        // Function to add markers from data
        function addMarkers(items) {
          items.forEach((item, i) => {
            const lon = item.lng || item.Longitude;
            const lat = item.lat || item.Latitude;
            const t = item.temp || item.Result;
            const name = item.siteName || item.Label;
            const tempColor = getTemperatureColor(t);

            console.log(`Plotting [${i}]: ${name} @ ${lat},${lon} = ${t}°C`);
            
            const icon = L.divIcon({
              className: 'custom-temp-marker',
              html: `<div class="temp-label" style="background-color: ${tempColor};">${t}°C</div>`,
              iconSize: [40,40],
              iconAnchor: [20,20]
            });

            const marker = L.marker([lat, lon], { icon })
                            .addTo(map)
                            .bindPopup(`<strong>${name}</strong><br/>${t}°C`);

            markersRef.current.push({ marker, tempC: t, name, lat, lon });
          });
        }

        // Function to add water temperature markers
        async function addLiveWaterTempMarkers() {
          try {
            // Step 1: Check cache first and load instantly if available
            const cache = localStorage.getItem('waterData');
            if (cache) {
              const cachedItems = JSON.parse(cache);
              console.log('📦 Loading from cache:', cachedItems.length, 'items');
              addMarkers(cachedItems);
              setLoading(false); // Hide loading immediately
            }

            // Step 2: Fetch fresh data in background
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/water-data`);
            const data = await response.json();
            
            globalBeach = data; // idk if this is a good idea but we now have a global variable to access fetched beach data
            window.dispatchEvent(new Event('dataloaded')); // Notify listeners that data has been loaded
            
                        
            if (data?.items?.length) {
              console.log('🔄 Got fresh data:', data.items.length, 'items');
              
              // Clear existing markers before adding new ones
              markersRef.current.forEach(({ marker }) => {
                map.removeLayer(marker);
            });
            markersRef.current = [];
            
            console.log('Got data →', data);
            
            if (data && data.items) {
              data.items.forEach((item, i) => {
                // Use the correct field names from your API
                const lon = item.lng || item.Longitude;
                const lat = item.lat || item.Latitude;
                const t = item.temp || item.Result;
                const name = item.siteName || item.Label;
                const tempColor = getTemperatureColor(t);
                


                console.log(`Plotting [${i}]: ${name} @ ${lat},${lon} = ${t}°C`);                const icon = L.divIcon({
                  className: 'custom-temp-marker',
                  html: `<div class="temp-label" style="background-color: ${tempColor};">${t}°C</div>`,
                  iconSize: [40,40],
                  iconAnchor: [20,20]
                });

                const marker = L.marker([lat, lon], { icon })
                                .addTo(map)
                                .bindPopup(`<strong>${name}</strong><br/>${t}°C`);

                markersRef.current.push({ marker, tempC: t, name, lat, lon });
              
              
              // Add fresh markers
              addMarkers(data.items);
              
              // Update cache with fresh data
              localStorage.setItem('waterData', JSON.stringify(data.items));
            }
            
            setLoading(false);
          } catch (err) {
            console.error('fetch error →', err);
            // If no cache was loaded and fetch failed, still hide loading
            setLoading(false);
          }
        }

        // Add water markers after map loads
        addLiveWaterTempMarkers();
              }
    };

    initMap();

    // Listen for unit toggles
    const onUnitChange = () => {
      const unit = window.temperatureUnit || 'C';
      markersRef.current.forEach(({ marker, tempC, name }) => {
        const display = unit === 'F'
          ? (tempC * 9/5 + 32).toFixed(1)
          : tempC;
        
        // Calculate color based on the temperature in the current unit
        const tempForColor = unit === 'F' ? (tempC * 9/5 + 32) : tempC;
        const tempColor = getTemperatureColor(tempForColor, unit);
        
        // update icon with proper color
        marker.setIcon(window.L.divIcon({
          className: 'custom-temp-marker',
          html: `<div class="temp-label" style="background-color: ${tempColor};">${display}°${unit}</div>`,
          iconSize: [40,40],
          iconAnchor: [20,20]
        }));
        // update popup
        marker.getPopup().setContent(`<strong>${name}</strong><br/>${display}°${unit}`);
      });
    };

    window.addEventListener('unitchange', onUnitChange);
    return () => {
      window.removeEventListener('unitchange', onUnitChange);
      if (mapInstanceRef.current) mapInstanceRef.current.remove();
    };
  }, []);

  // Handle beach search by name
  function handleSearch(selectedName) {
    if (!mapInstanceRef.current) return;
    const term = (selectedName || searchTerm).trim().toLowerCase();
    if (!term) return;
    const match = markersRef.current.find(item =>
      item.name.toLowerCase().includes(term)
    );
    if (match) {
      const map = mapInstanceRef.current;
      const currentZoom = map.getZoom();
      const targetZoom = 15;
      
      // First pan to the location at current zoom level with offset
      const offsetY = 150;
      const offsetX = 0;
      const targetLatLng = [match.lat, match.lon];
      const pointAtCurrentZoom = map.project(targetLatLng, currentZoom);
      const offsetPointAtCurrentZoom = pointAtCurrentZoom.subtract([offsetX, offsetY]);
      const offsetLatLngAtCurrentZoom = map.unproject(offsetPointAtCurrentZoom, currentZoom);
      
      // First just pan to the location at the current zoom level
      map.once('moveend', function() {
        // After panning completes, smoothly zoom in
        map.once('zoomend', function() {
          // After zooming completes, open the popup
          match.marker.openPopup();
        });
        
        // Animate zoom with a duration in ms
        map.flyTo(offsetLatLng, targetZoom, {
          duration: 0.5, // seconds
          easeLinearity: 0.2
        });
      });
      
      // Start the sequence by panning
      map.panTo(offsetLatLngAtCurrentZoom, { 
        animate: true,
        duration: 0.75 // seconds
      });
      
      // Calculate the final offset point at target zoom for later use
      const pointAtTargetZoom = map.project(targetLatLng, targetZoom);
      const offsetPointAtTargetZoom = pointAtTargetZoom.subtract([offsetX, offsetY]);
      const offsetLatLng = map.unproject(offsetPointAtTargetZoom, targetZoom);
    } else {
      alert('Beach not found');
    }
  }

  // Autofill suggestions logic
  function handleInputChange(e) {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const lower = value.toLowerCase();
    const allNames = markersRef.current.map(m => m.name);
    const filtered = allNames.filter(name => name.toLowerCase().includes(lower));
    setSuggestions(filtered.slice(0, 6)); // limit to 6 suggestions
    setShowSuggestions(true);
  }

  function handleSuggestionClick(name) {
    setSearchTerm(name);
    setShowSuggestions(false);
    handleSearch(name);
  }

  function handleInputBlur() {
    setTimeout(() => setShowSuggestions(false), 100); // allow click
  }

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: 0,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          zIndex: 1000
        }}
      >
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
            placeholder="Search beach..."
            style={{
              padding: '5px',
              width: '200px',
              background: '#fff',
              border: '1px solid #ccc',
              borderRadius: '4px 0 0 4px',
              outline: 'none',
              color: '#000',
              '::placeholder': { color: '#000' }
            }}
            onFocus={() => { if (searchTerm) setShowSuggestions(true); }}
            onBlur={handleInputBlur}
          />
         {showSuggestions && suggestions.length > 0 && (
           <ul style={{
             position: 'absolute',
             top: '36px',
             left: 0,
             width: '100%',
             background: '#fff',
             border: '1px solid #ccc',
             borderRadius: '4px 0 0 4px',
             color: '#000',
             borderTop: 'none',
             maxHeight: '180px',
             overflowY: 'auto',
             margin: 0,
             padding: 0,
             listStyle: 'none',
             zIndex: 2000
           }}>
             {suggestions.map((name, idx) => (
               <li
                 key={name + idx}
                 onMouseDown={() => handleSuggestionClick(name)}
                 style={{
                   padding: '6px 10px',
                   cursor: 'pointer',
                   background: name === searchTerm ? '#eee' : '#fff',
                   borderBottom: idx !== suggestions.length - 1 ? '1px solid #eee' : 'none'
                 }}
               >
                 {name}
               </li>
             ))}
           </ul>
         )}
        </div>
        <button
          onClick={handleSearch}
          style={{
            marginLeft: '0',
            padding: '5px 16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            background: '#000',
            color: '#fff',
            border: '1px solid #000',
            borderRadius: '0 4px 4px 0',
            outline: 'none',
          }}
        >
          Search
        </button>
      </div>
      <div
        ref={mapRef}
        style={{
          height: '100vh',
          width: '100%'
        }}
      />
    </div>
  );
}

export { globalBeach }