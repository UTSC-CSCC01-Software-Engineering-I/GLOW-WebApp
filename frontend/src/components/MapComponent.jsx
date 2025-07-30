"use client";

import React, { useEffect, useState, useRef } from 'react';
import '../styles/MapView.css';
import '../styles/homepage.css'; // Shaafs code

import {
  Chart,
  CategoryScale,
  LinearScale,
  TimeScale,
  LineElement,
  PointElement,
  LineController,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Import the date adapter properly
import 'chartjs-adapter-date-fns';

// Register the required components
Chart.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  LineElement,
  PointElement,
  LineController,
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

    return data.data;
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return [];
  }
}

let globalBeach = null;

export default function MapComponent() {
  const mapRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // Temperature color function - works with both Celsius and Fahrenheit
  function getTemperatureColor(temp, unit = 'C', mode = 'light') {
    const tempC = unit === 'F' ? (temp - 32) * 5 / 9 : parseFloat(temp);
  
    const min = 0;
    const max = 30;
    const ratio = Math.min(1, Math.max(0, (tempC - min) / (max - min)));
  
    const hue = 270 - ratio * 270; // purple → red
    const saturation = 100;
    const lightness = mode === 'dark' ? 50 : 60;
    const alpha = 0.8;
  
    return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.loadedAPI = loading;
      window.dispatchEvent(new Event('dataloaded'));
    }
  });

  useEffect(() => {
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

      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      if (mapRef.current && !mapInstanceRef.current) {
        const map = L.map(mapRef.current, {
          center: [43.647216678117736, -79.36719310664458],
          zoom: 12,
          layers: [prefersDark ? darkLayer : lightLayer]
        });
        
        mapInstanceRef.current = map;
        window.leafletMap = map;
        window.lightLayer = lightLayer;
        window.darkLayer = darkLayer;

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

              const sortedData = historicalData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

              // Declare currentUnit BEFORE using it
              const currentUnit = window.temperatureUnit || 'C';

              // Create time-based data for proper spacing
              const timeBasedData = sortedData.map((d) => ({
                x: new Date(d.timestamp),
                y: currentUnit === 'F' ? (d.temp * 9) / 5 + 32 : d.temp
              }));

              const timeDifferences = [];
              for (let i = 1; i < sortedData.length; i++) {
                const prevTime = new Date(sortedData[i - 1].timestamp);
                const currTime = new Date(sortedData[i].timestamp);
                const diffHours = Math.round((currTime - prevTime) / (1000 * 60 * 60));
                timeDifferences.push(`${diffHours}h gap`);
              }

              // Create graph container
              const graphContainer = document.createElement('div');
              graphContainer.style.width = '600px';
              graphContainer.style.height = '420px';
              graphContainer.style.padding = '15px';
              graphContainer.style.backgroundColor = window.globalTheme === 'dark' ? '#1a1a1a' : '#ffffff';
              graphContainer.style.borderRadius = '12px';
              graphContainer.style.boxShadow = window.globalTheme === 'dark' 
                ? '0 8px 32px rgba(0,255,255,0.2)' 
                : '0 8px 32px rgba(0,0,0,0.15)';
              graphContainer.style.border = window.globalTheme === 'dark' ? '1px solid #333' : '1px solid #ddd';

              const canvas = document.createElement('canvas');
              canvas.style.width = '100%';
              canvas.style.height = 'calc(100% - 40px)';
              canvas.width = 570;
              canvas.height = 380;
              graphContainer.appendChild(canvas);

              const timeDiffDiv = document.createElement('div');
              timeDiffDiv.style.marginTop = '10px';
              timeDiffDiv.style.fontSize = '12px';
              timeDiffDiv.style.color = window.globalTheme === 'dark' ? '#ccc' : '#666';
              timeDiffDiv.innerHTML = `<strong>Time gaps:</strong> ${timeDifferences.join(', ')}`;
              graphContainer.appendChild(timeDiffDiv);
              
              console.log('Creating chart with time-based data:', timeBasedData);
              
              // Create the chart with time scale - this gives proper spacing
              const chart = new Chart(canvas, {
                type: 'line',
                data: {
                  datasets: [
                    {
                      data: timeBasedData, // Use time-based data {x: timestamp, y: value}
                      borderColor: window.globalTheme === 'dark' ? 'rgba(0, 217, 255, 1)' : 'rgba(75, 192, 192, 1)',
                      backgroundColor: window.globalTheme === 'dark' ? 'rgba(0, 217, 255, 0.1)' : 'rgba(75, 192, 192, 0.2)',
                      fill: true,
                      tension: 0.3,
                      pointRadius: 6,
                      pointHoverRadius: 10,
                      pointBackgroundColor: window.globalTheme === 'dark' ? 'rgba(0, 217, 255, 1)' : 'rgba(75, 192, 192, 1)',
                      pointBorderColor: window.globalTheme === 'dark' ? '#000' : '#fff',
                      pointBorderWidth: 2,
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
                      font: {
                        size: 18,
                        weight: 'bold'
                      },
                      color: window.globalTheme === 'dark' ? '#fff' : '#333',
                      padding: 20
                    },
                    legend: {
                      display: false
                    },
                    tooltip: {
                      backgroundColor: window.globalTheme === 'dark' ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                      titleColor: window.globalTheme === 'dark' ? '#fff' : '#000',
                      bodyColor: window.globalTheme === 'dark' ? '#fff' : '#000',
                      borderColor: window.globalTheme === 'dark' ? '#444' : '#ddd',
                      borderWidth: 1,
                      displayColors: false,
                      callbacks: {
                        title: function(context) {
                          const date = new Date(context[0].parsed.x);
                          return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                        },
                        label: function(context) {
                          return `${context.parsed.y.toFixed(1)}°${currentUnit}`;
                        },
                        afterBody: function(context) {
                          const dataIndex = context[0].dataIndex;
                          if (dataIndex > 0 && timeDifferences[dataIndex - 1]) {
                            return [`Gap from previous: ${timeDifferences[dataIndex - 1]}`];
                          }
                          return [];
                        }
                      }
                    }
                  },
                  scales: {
                    x: {
                      type: 'linear', // Use linear instead of time to avoid adapter issues
                      position: 'bottom',
                      title: {
                        display: true,
                        text: 'Date & Time',
                        color: window.globalTheme === 'dark' ? '#fff' : '#333',
                        font: {
                          size: 14,
                          weight: 'bold'
                        }
                      },
                      ticks: {
                        color: window.globalTheme === 'dark' ? '#ccc' : '#666',
                        maxRotation: 45,
                        font: {
                          size: 10
                        },
                        callback: function(value, index) {
                          // Convert the linear value back to a proper date string
                          if (timeBasedData[index]) {
                            const date = new Date(timeBasedData[index].x);
                            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                          }
                          return '';
                        }
                      },
                      grid: {
                        color: window.globalTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                      }
                    },
                    y: {
                      title: {
                        display: true,
                        text: `Temperature (°${currentUnit})`,
                        color: window.globalTheme === 'dark' ? '#fff' : '#333',
                        font: {
                          size: 14,
                          weight: 'bold'
                        }
                      },
                      ticks: {
                        color: window.globalTheme === 'dark' ? '#ccc' : '#666',
                        font: {
                          size: 11
                        },
                        callback: function(value) {
                          return `${value}°${currentUnit}`;
                        }
                      },
                      grid: {
                        color: window.globalTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                      }
                    },
                  },
                  interaction: {
                    intersect: false,
                    mode: 'index'
                  }
                },
              });

              console.log('Chart created:', chart);

              marker.chartInstance = chart;
              marker.chartData = sortedData;

              // Open popup
              const popup = L.popup({
                offset: [10, -20],
                maxWidth: 650,
                maxHeight: 470,
                className: 'custom-popup'
              })
              .setLatLng([lat, lon])
              .setContent(graphContainer)
              .openOn(mapInstanceRef.current);

              // Force chart resize after popup is opened
              setTimeout(() => {
                if (chart && chart.resize) {
                  chart.resize();
                  console.log('Chart resized');
                }
              }, 100);
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
        if (marker.chartInstance && marker.chartData) {
          const chart = marker.chartInstance;
          
          // Convert original data to new unit with time structure
          const newTimeBasedData = marker.chartData.map((d) => ({
            x: new Date(d.timestamp),
            y: unit === 'F' ? (d.temp * 9) / 5 + 32 : d.temp
          }));

          // Update dataset with time-based data
          chart.data.datasets[0].data = newTimeBasedData;

          // Update the y-axis title
          chart.options.scales.y.title.text = `Temperature (°${unit})`;
          
          // Update y-axis tick callback
          chart.options.scales.y.ticks.callback = function(value) {
            return `${value}°${unit}`;
          };

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

  // Remove this duplicate useEffect - it's causing conflicts
  // useEffect(() => {
  //   const onUnitChange = () => {
  //     // ... duplicate code ...
  //   };
  //   window.addEventListener('unitchange', onUnitChange);
  //   return () => {
  //     window.removeEventListener('unitchange', onUnitChange);
  //   };
  // }, []);

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