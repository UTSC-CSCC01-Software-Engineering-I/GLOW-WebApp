"use client";

import React, { useEffect, useState, useRef } from 'react';
import '../styles/MapView.css';

export default function MapComponent() {
  const mapRef = useRef(null);
  const [loading, setLoading] = useState(true); // shaaf here: I am adding this so we can track when the api loads stuff
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);      // ← store { marker, tempC, name }

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

        // Function to add water temperature markers
        async function addLiveWaterTempMarkers() {
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/water-data`);
            const data = await response.json();
            
            console.log('Got data →', data);
            
            if (data && data.items) {
              data.items.forEach((item, i) => {
                // Use the correct field names from your API
                const lon = item.lng || item.Longitude;
                const lat = item.lat || item.Latitude;
                const t = item.temp || item.Result;
                const name = item.siteName || item.Label;

                console.log(`Plotting [${i}]: ${name} @ ${lat},${lon} = ${t}°C`);                const icon = L.divIcon({
                  className: 'custom-temp-marker',
                  html: `<div class="temp-label">${t}°C</div>`,
                  iconSize: [40,40],
                  iconAnchor: [20,20]
                });

                const marker = L.marker([lat, lon], { icon })
                                .addTo(map)
                                .bindPopup(`<strong>${name}</strong><br/>${t}°C`);

                markersRef.current.push({ marker, tempC: t, name });
              });
            }
          } catch (err) {
            console.error('fetch error →', err);
          }
        }

        // Add water markers after map loads
        addLiveWaterTempMarkers().finally(() => {
          // shaaf here: this code is responsible for finish loading signal
          // setLoading(false); 
        });
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
        // update icon
        marker.setIcon(window.L.divIcon({
          className: 'custom-temp-marker',
          html: `<div class="temp-label">${display}°${unit}</div>`,
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

  return (
    <div 
      ref={mapRef}
      style={{
        height: '100vh',
        width: '100%'
      }}
    />
  );
}