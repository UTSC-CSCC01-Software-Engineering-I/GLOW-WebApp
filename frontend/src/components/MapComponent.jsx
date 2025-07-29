"use client";

import React, { useEffect, useState, useRef } from 'react';
import '../styles/MapView.css';
import '../styles/homepage.css'; // Shaafs code


// Pranavs Code
import {
  Chart,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  LineController, // Import LineController
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register the required components
Chart.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  LineController, // Register LineController
  Title,
  Tooltip,
  Legend
);

// Async function to fetch historical data for a specific beach
async function fetchHistoricalData(beachName) {
  try {
    const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    const response = await fetch(`${NEXT_PUBLIC_API_URL}/beach-history?beachName=${encodeURIComponent(beachName)}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch historical data');
    }

    return data.data; // Return the historical data
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return []; // Return an empty array if there's an error
  }
}
// Till here



let globalBeach = null;

export default function MapComponent() {
  const mapRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);      // ← store { marker, tempC, name }

  // Temperature color function - works with both Celsius and Fahrenheit
  function getTemperatureColor(temp, unit = 'C', mode = 'light') {
    const tempC = unit === 'F' ? (temp - 32) * 5 / 9 : parseFloat(temp);
  
    const min = 0;
    const max = 30;
    const ratio = Math.min(1, Math.max(0, (tempC - min) / (max - min)));
  
    const hue = 270 - ratio * 270; // purple → red
    const saturation = 100;
    const lightness = mode === 'dark' ? 50 : 60;
    const alpha = 0.8; // adjust for more or less transparency
  
    return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
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
            const lon = item.lng || item.lon || item.Longitude;
            const lat = item.lat || item.Latitude;
            const t = item.temp || item.Result;
            const name = item.siteName || item.Label || `User Point ${i + 1}`;
            const tempColor = getTemperatureColor(t);

            console.log(`Plotting [${i}]: ${name} @ ${lat},${lon} = ${t}°C`);

            const icon = L.divIcon({
              className: 'custom-temp-marker',
              html: `<div class="temp-label" style="background-color: ${tempColor};">${t}°C</div>`,
              iconSize: [40, 40],
              iconAnchor: [20, 20],
            });

            const marker = L.marker([lat, lon], { icon }).addTo(map);

            marker.on('click', async () => {
              const historicalData = await fetchHistoricalData(name);

              if (historicalData.length === 0) {
                marker.bindPopup(`<strong>${name}</strong><br/>No historical data available`).openPopup();
                return;
              }

              if (historicalData.length < 2) {
                marker.bindPopup(`<strong>${name}</strong><br/>Not enough data to generate a graph`).openPopup();
                return;
              }

              const labels = historicalData.map((d) => new Date(d.timestamp).toLocaleDateString());
              let temperatures = historicalData.map((d) => d.temp);

              // Check the current temperature unit and convert if necessary
              const currentUnit = window.temperatureUnit || 'C';
              if (currentUnit === 'F') {
                temperatures = temperatures.map((temp) => (temp * 9) / 5 + 32); // Convert to Fahrenheit
              }

              const graphContainer = document.createElement('div');
              graphContainer.style.width = '300px';
              graphContainer.style.height = '200px';

              const canvas = document.createElement('canvas');
              graphContainer.appendChild(canvas);

              marker.bindPopup(graphContainer).openPopup();

              const chart = new Chart(canvas, {
                type: 'line',
                data: {
                  labels,
                  datasets: [
                    {
                      label: `Temperature (°${currentUnit})`,
                      data: temperatures,
                      borderColor: 'rgba(75, 192, 192, 1)',
                      backgroundColor: 'rgba(75, 192, 192, 0.2)',
                      fill: true,
                    },
                  ],
                },
                options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    title: {
                      display: true,
                      text: `Historical Data for ${name}`,
                    },
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: 'Date',
                      },
                    },
                    y: {
                      title: {
                        display: true,
                        text: `Temperature (°${currentUnit})`,
                      },
                    },
                  },
                },
              });

              // Store the chart instance for dynamic updates
              marker.chartInstance = chart;
            });

            markersRef.current.push({ marker, tempC: t, name, lat, lon });
          });
        }

        // Function to add water temperature markers
        async function addLiveWaterTempMarkers() {
          try {
            // Step 1: Check cache first and load instantly if available
            const cache = localStorage.getItem('waterData');
            const cacheTimestamp = localStorage.getItem('waterDataTimestamp');
            const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
            
            const isCacheValid = cache && cacheTimestamp && 
              (Date.now() - parseInt(cacheTimestamp)) < CACHE_DURATION;
            
            if (isCacheValid) {
              const cachedItems = JSON.parse(cache);
              console.log('📦 Loading from cache:', cachedItems.length, 'items (age:', Math.round((Date.now() - parseInt(cacheTimestamp)) / 1000), 'seconds)');

              
              // Set global variable immediately for HUDleftPoints
              globalBeach = { items: cachedItems };
              
              // Notify HUDleftPoints that cached data is available
              window.dispatchEvent(new Event('dataloaded'));
              
              addMarkers(cachedItems);
              setLoading(false); // Hide loading immediately
            } else if (cache) {
              console.log('📦 Cache expired, loading old data while fetching fresh...');
              const cachedItems = JSON.parse(cache);
              globalBeach = { items: cachedItems };
              addMarkers(cachedItems);
              setLoading(false);
            }

            // Step 2: Fetch fresh data in background (always fetch if cache is expired or missing)
            if (!isCacheValid) {
              console.log('🔄 Fetching fresh data...');
              let officialData = { items: [] }, userData = { items: [] };

              try {
                const [officialRes, userRes] = await Promise.all([
                  fetch(`${process.env.NEXT_PUBLIC_API_URL}/water-data`),
                  fetch(`${process.env.NEXT_PUBLIC_API_URL}/userpoints`)
                ]);

                if (officialRes.ok) {
                  officialData = await officialRes.json();
                } else {
                  console.warn('❌ Failed /water-data:', officialRes.statusText);
                }

                if (userRes.ok) {
                  userData = await userRes.json();
                } else {
                  console.warn('❌ Failed /userpoints:', userRes.statusText);
                }
              } catch (err) {
                console.error('Network error:', err);
              }

                
              const combined = [...(officialData.items || []), ...(userData.items || [])];
              globalBeach = { items: combined };
              console.log('Got fresh data →', combined);

                          
              if (combined.length) {
                console.log('✅ Got fresh data:',combined.length, 'items');
                
                // Clear existing markers before adding new ones
                markersRef.current.forEach(({ marker }) => {
                  map.removeLayer(marker);
                });
                markersRef.current = [];
                
                // Add fresh markers
                addMarkers(combined);
                
                // Update cache with fresh data and timestamp
                localStorage.setItem('waterData', JSON.stringify(combined));
                localStorage.setItem('waterDataTimestamp', Date.now().toString());
                
                // Notify listeners that data has been loaded AFTER markers are added
                window.dispatchEvent(new Event('dataloaded'));
              }
            } else {
              console.log('✅ Using cached data, no fetch needed');

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
        // Convert the original tempC value to the desired unit
        const display = unit === 'F'
          ? ((tempC * 9 / 5) + 32).toFixed(1)
          : tempC;

        // Calculate color based on the temperature in the current unit
        const tempForColor = unit === 'F' ? ((tempC * 9 / 5) + 32) : tempC;
        const tempColor = getTemperatureColor(tempForColor, unit);

        // Update marker icon
        marker.setIcon(window.L.divIcon({
          className: 'custom-temp-marker',
          html: `<div class="temp-label" style="background-color: ${tempColor};">${display}°${unit}</div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        }));

        // Update the graph if it exists
        if (marker.chartInstance) {
          const chart = marker.chartInstance;

          // Use the original tempC values for conversion
          chart.data.datasets[0].data = historicalData.map((_, index) =>
            unit === 'F'
              ? ((markersRef.current[index].tempC * 9 / 5) + 32).toFixed(1)
              : markersRef.current[index].tempC
          );

          // Update the dataset label
          chart.data.datasets[0].label = `Temperature (°${unit})`;

          // Update the y-axis label
          if (chart.options.scales.y && chart.options.scales.y.title) {
            chart.options.scales.y.title.text = `Temperature (°${unit})`;
          }

          // Apply the updates
          chart.update();
        }
      });
    };

    // Add the event listener
    window.addEventListener('unitchange', onUnitChange);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('unitchange', onUnitChange);
      if (mapInstanceRef.current) mapInstanceRef.current.remove();
    };
  }, []);

    useEffect(() => {
    const onUnitChange = () => {
      const unit = window.temperatureUnit || 'C';
  
      markersRef.current.forEach(({ marker, tempC, name }) => {
        const display = unit === 'F'
          ? (tempC * 9 / 5 + 32).toFixed(1)
          : tempC;
  
        // Calculate color based on the temperature in the current unit
        const tempForColor = unit === 'F' ? (tempC * 9 / 5 + 32) : tempC;
        const tempColor = getTemperatureColor(tempForColor, unit);
  
        // Update marker icon
        marker.setIcon(window.L.divIcon({
          className: 'custom-temp-marker',
          html: `<div class="temp-label" style="background-color: ${tempColor};">${display}°${unit}</div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        }));
  
        // Update the graph if it exists
        if (marker.chartInstance) {
          const chart = marker.chartInstance;
          chart.data.datasets[0].data = chart.data.datasets[0].data.map((temp) =>
            unit === 'F' ? (temp * 9 / 5 + 32).toFixed(1) : ((temp - 32) * 5 / 9).toFixed(1)
          );
          chart.data.datasets[0].label = `Temperature (°${unit})`;
          chart.update();
        }
      });
    };
  
    // Add the event listener
    window.addEventListener('unitchange', onUnitChange);
  
    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('unitchange', onUnitChange);
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

  // Expose search function globally for other components
  useEffect(() => {
    window.handleMapSearch = handleSearch;
    return () => {
      window.handleMapSearch = null;
    };
  }, []);

  useEffect(() => {
    const handleFilter = (e) => {
      const { min, max } = e.detail;
      markersRef.current.forEach(({ marker, tempC }) => {
        const keep =
          (isNaN(min) || tempC >= min) &&
          (isNaN(max) || tempC <= max);

        if (keep) {
          // re-add if it was removed
          marker.addTo(mapInstanceRef.current);
        } else {
          mapInstanceRef.current.removeLayer(marker);
        }
      });
    };

    window.addEventListener('filterchange', handleFilter);
    return () => {
      window.removeEventListener('filterchange', handleFilter);
    };
  }, []);

  return (
  <div style={{ position: 'relative', height: '100vh', width: '100%' }}>
    {/* Map container */}
    <div
      ref={mapRef}
      style={{
        height: '100%',
        width: '100%'
      }}
    />

    <div className="legend">
      <div className="legend-bar"></div>
      <div className="legend-labels">
        <span>30°C</span>
        <span>20°C</span>
        <span>10°C</span>
        <span>0°C</span>
      </div>
    </div>
  </div>

   
  
);
  
}

export { globalBeach }