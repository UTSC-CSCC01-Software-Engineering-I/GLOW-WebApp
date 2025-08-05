"use client";

import React, { useEffect, useState, useRef } from 'react';
import '../styles/MapView.css';
import '../styles/homepage.css'; // Shaafs code
import { ThemeManager } from '../utils/themeManager';
import { UnitManager } from '../utils/unitManager';
import { formatTemperature } from '../utils/temperatureUtils';

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
    const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://glow-backend-v4-0-0.onrender.com/api';

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
  const [unit, setUnit] = useState(() => UnitManager.getUnit());
  const userLocationRef = useRef(null);

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

  // Add this function for better contrast calculation
  function getAccessibleTemperatureColor(temp, unit = 'C', mode = 'light') {
    const tempC = unit === 'F' ? (temp - 32) * 5 / 9 : parseFloat(temp);

    const min = 0;
    const max = 30;
    const ratio = Math.min(1, Math.max(0, (tempC - min) / (max - min)));

    const hue = 270 - ratio * 270; // purple → red  
    const saturation = 90; // Slightly reduced for better readability
    
    // Ensure sufficient contrast for WCAG AA compliance
    const lightness = mode === 'dark' ? 45 : 35; // Darker colors for better contrast
    const alpha = 0.9; // Higher opacity for better visibility

    return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
  }

  // Add this function to get temperature category for screen readers
  function getTemperatureCategory(tempC) {
    if (tempC < 5) return 'Very Cold';
    if (tempC < 15) return 'Cold';
    if (tempC < 20) return 'Cool';
    if (tempC < 25) return 'Warm';
    return 'Hot';
  }

  // Add this function to get temperature icon/symbol
  function getTemperatureSymbol(tempC) {
    if (tempC < 5) return '🧊'; // ice
    if (tempC < 15) return '❄️'; // snowflake
    if (tempC < 20) return '🌊'; // wave
    if (tempC < 25) return '🏊'; // swimmer
    return '🔥'; // fire
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

      // Use ThemeManager to determine initial theme
      const currentTheme = ThemeManager.getTheme();
      const isDarkTheme = currentTheme === 'dark';
      console.log('🗺️ MapComponent: Initializing map with theme:', currentTheme);
      
      if (mapRef.current && !mapInstanceRef.current) {
        const map = L.map(mapRef.current, {
          center: [43.647216678117736, -79.36719310664458],
          zoom: 12,
          zoomControl: false,
          layers: [isDarkTheme ? darkLayer : lightLayer]
        });
        
        mapInstanceRef.current = map;
        window.leafletMap = map;
        window.lightLayer = lightLayer;
        window.darkLayer = darkLayer;

        // Listen for theme changes using ThemeManager
        const removeThemeListener = ThemeManager.addThemeChangeListener((newTheme) => {
          console.log('🗺️ MapComponent: Theme changed to:', newTheme);
          if (newTheme === 'dark') {
            map.removeLayer(lightLayer);
            map.addLayer(darkLayer);
          } else {
            map.removeLayer(darkLayer);
            map.addLayer(lightLayer);
          }
        });

        // Store the cleanup function for later use
        map._themeCleanup = removeThemeListener;

        // Function to add a marker for a single item - extracted for reuse
        function addMarkerForItem(item, i, isGrouped = false) {
          const lon = item.lng || item.lon || item.Longitude;
          const lat = item.lat || item.Latitude;
          const t = item.temp || item.Result;
          const name = item.siteName || item.Label || `User Point ${i + 1}`;
          
          // determine age (fallback to createdAt for user‐points)
          const rawTime = item.timestamp || item.createdAt || item.created_at;
          const ts = new Date(rawTime).getTime();
          const isStale = !isNaN(ts) && (Date.now() - ts) > 2 * 24 * 60 * 60 * 1000; // older than 2 days

          const currentUnit = UnitManager.getUnit();
          const formattedTemp = formatTemperature(t, currentUnit);
          const tempColor = getAccessibleTemperatureColor(t, 'C');
          const tempCategory = getTemperatureCategory(t);

          // outline for stale, grey text for stale
          const outlineStyle = isStale ? 'border: 2px solid grey;' : '';
          const valueColor   = isStale ? 'color: grey;' : '';

          // determine stale styling
          const bgColor = isStale ? '#ffffff20' : tempColor;
          const staleFilter = isStale
            ? 'backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);'
            : '';
            
          // If this is a grouped user point, modify the marker appearance
          const groupLabel = isGrouped && item.pointCount > 1 
            ? `<span class="group-count">${item.pointCount}</span>` 
            : '';
          
          const groupStyle = isGrouped && item.pointCount > 1
            ? 'border: 2px solid #fff; transform: scale(1.1);'
            : '';

          const icon = L.divIcon({
            className: 'custom-temp-marker',
            html: `
              <div 
                class="temp-label accessible-marker${isStale ? ' stale' : ''}${isGrouped && item.pointCount > 1 ? ' grouped' : ''}"
                style="
                  background-color: ${bgColor};
                  ${outlineStyle}
                  ${staleFilter}
                  ${groupStyle}
                "
                role="button"
                tabindex="0"
                aria-label="Water temperature ${formattedTemp} at ${name}. ${isGrouped && item.pointCount > 1 ? `Group of ${item.pointCount} user points. ` : ''}${isStale ? 'Data older than 2 days.' : `Category: ${tempCategory}. Press Enter or Space to view details.`}"
                data-temp-category="${tempCategory.toLowerCase().replace(/ /g,'-')}"
              >
                <span class="temp-value" style="${valueColor}">${formattedTemp}</span>
                ${groupLabel}
              </div>
            `,
            iconSize: [50, 40],
            iconAnchor: [25, 20],
          });

          const marker = L.marker([lat, lon], { icon }).addTo(mapInstanceRef.current);

          // Set group information for popup display
          if (isGrouped && item.pointCount > 1) {
            marker.isGrouped = true;
            marker.pointCount = item.pointCount;
          }

          // bump this marker to the top on hover
          marker.on('mouseover', () => {
            marker.setZIndexOffset(1000);
          });
          // reset when mouse leaves
          marker.on('mouseout', () => {
            marker.setZIndexOffset(0);
          });

          // Add function to announce to screen readers (this was missing)
          function announceToScreenReader(message) {
            const announcement = document.createElement('div');
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            announcement.className = 'sr-only';
            announcement.textContent = message;
            
            document.body.appendChild(announcement);
            
            // Remove after announcement
            setTimeout(() => {
              if (document.body.contains(announcement)) {
                document.body.removeChild(announcement);
              }
            }, 1000);
          }

          // Add click handler FIRST (this is the main functionality)
          marker.on('click', async () => {
            // add prefix for grey (stale) points
            const labelPrefix = isStale ? '<strong>OLD:</strong> ' : '';
            
            // add prefix for grouped points
            const groupPrefix = isGrouped && item.pointCount > 1 
              ? `<strong>GROUP:</strong> ${item.pointCount} points within 1km • ` 
              : '';

            let historicalData = [];
            
            // For grouped user points, use the collected historical points
            if (isGrouped && item.historicalPoints && item.historicalPoints.length > 0) {
              historicalData = item.historicalPoints;
            } else {
              // For non-grouped points, fetch data from API as usual
              historicalData = await fetchHistoricalData(name);
            }
            
            const popupOffset = [17, -32];

            // no historical data
            if (historicalData.length === 0) {
              // Ensure popup is rebinding so it can reopen
              marker.closePopup();
              marker.unbindPopup();
              marker.bindPopup(`
                <div role="dialog" aria-labelledby="popup-title-${i}">
                  <h3 id="popup-title-${i}">${labelPrefix}${groupPrefix}${name}</h3>
                  <p>No historical data available</p>
                  ${
                    isStale
                      ? `<p>Last updated at: ${new Date(rawTime).toLocaleString()}</p>`
                      : `<p>Current temperature: ${formattedTemp} (${tempCategory})</p>`
                  }
                  ${isGrouped && item.pointCount > 1 ? '<p>This is a group of multiple user points within 1km radius. The most recent temperature is shown.</p>' : ''}
                </div>
              `, {
                offset: popupOffset,
                className: 'custom-popup'
              });
              marker.openPopup();
              return;
            }

            if (historicalData.length < 2) {
              // Rebind popup to guarantee it opens on every click
              marker.closePopup();
              marker.unbindPopup();
              marker.bindPopup(`
                <div role="dialog" aria-labelledby="popup-title-${i}">
                  <h3 id="popup-title-${i}">${labelPrefix}${groupPrefix}${name}</h3>
                  <p>Not enough data to generate a graph.</p>
                  <p>Last updated at: ${new Date(rawTime).toLocaleString()}</p>
                </div>
              `, {
                offset: popupOffset,
                className: 'custom-popup'
              });
              marker.openPopup();
              return;
            }

            // Sort the historical data by timestamp
            const sortedData = historicalData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

            // Declare currentUnit BEFORE using it
            const currentUnit = UnitManager.getUnit();

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

            // Create graph container with responsive dimensions
            const graphContainer = document.createElement('div');
            graphContainer.className = 'historical-data-container';
            
            // Detect mobile viewport
            const isMobile = window.innerWidth <= 768;
            const isSmallMobile = window.innerWidth <= 480;
            
            // Set responsive dimensions
            if (isSmallMobile) {
              graphContainer.style.width = '340px';
              graphContainer.style.height = '300px';
              graphContainer.style.padding = '8px';
            } else if (isMobile) {
              graphContainer.style.width = '450px';
              graphContainer.style.height = '350px';
              graphContainer.style.padding = '10px';
            } else {
              graphContainer.style.width = '600px';
              graphContainer.style.height = '420px';
              graphContainer.style.padding = '15px';
            }
            
            graphContainer.style.backgroundColor = window.globalTheme === 'dark' ? '#1a1a1a' : '#ffffff';
            graphContainer.style.borderRadius = isMobile ? '8px' : '12px';
            graphContainer.style.boxShadow = window.globalTheme === 'dark' 
              ? '0 8px 32px rgba(0,0,0,0.5)' 
              : '0 8px 32px rgba(0,0,0,0.15)';
            graphContainer.style.border = window.globalTheme === 'dark' ? '1px solid #333' : '1px solid #ddd';

            const canvas = document.createElement('canvas');
            canvas.style.width = '100%';
            canvas.style.height = 'calc(100% - 40px)';
            
            // Set canvas dimensions based on screen size
            if (isSmallMobile) {
              canvas.width = 320;
              canvas.height = 240;
            } else if (isMobile) {
              canvas.width = 420;
              canvas.height = 290;
            } else {
              canvas.width = 570;
              canvas.height = 380;
            }
            graphContainer.appendChild(canvas);
            
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
                    text: isGrouped && item.pointCount > 1 
                      ? `Historical Data for Group (${item.pointCount} points within 1km)`
                      : `Historical Data for ${name}`,
                    font: {
                      size: isSmallMobile ? 14 : (isMobile ? 16 : 18),
                      weight: 'bold'
                    },
                    color: window.globalTheme === 'dark' ? '#fff' : '#333',
                    padding: isSmallMobile ? 10 : (isMobile ? 15 : 20)
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
                        let info = [];
                        
                        // Add gap information
                        if (dataIndex > 0 && timeDifferences[dataIndex - 1]) {
                          info.push(`Gap from previous: ${timeDifferences[dataIndex - 1]}`);
                        }
                        
                        // For grouped points, add additional information
                        if (isGrouped && item.pointCount > 1) {
                          info.push(`From group of ${item.pointCount} user points within 1km`);
                        }
                        
                        return info;
                      }
                    }
                  }
                },
                scales: {
                  x: {
                    type: 'linear', // Use linear instead of time to avoid adapter issues
                    position: 'bottom',
                    title: {
                      display: !isSmallMobile, // Hide title on very small screens
                      text: 'Date & Time',
                      color: window.globalTheme === 'dark' ? '#fff' : '#333',
                      font: {
                        size: isSmallMobile ? 10 : (isMobile ? 12 : 14),
                        weight: 'bold'
                      }
                    },
                    ticks: {
                      color: window.globalTheme === 'dark' ? '#ccc' : '#666',
                      maxRotation: isMobile ? 45 : 45,
                      font: {
                        size: isSmallMobile ? 8 : (isMobile ? 9 : 10)
                      },
                      maxTicksLimit: isSmallMobile ? 3 : (isMobile ? 4 : 5), // Fewer ticks on mobile
                      callback: function(value) {
                        // The value here is the actual timestamp (milliseconds)
                        const date = new Date(value);
                        if (isNaN(date.getTime())) return ''; // Invalid date
                        
                        // Mobile-friendly date formatting
                        if (isSmallMobile) {
                          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        } else if (isMobile) {
                          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + '\n' + 
                                 date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                        } else {
                          return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                        }
                      }
                    },
                    grid: {
                      color: window.globalTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    }
                  },
                  y: {
                    title: {
                      display: !isSmallMobile, // Hide title on very small screens
                      text: `Temperature (°${currentUnit})`,
                      color: window.globalTheme === 'dark' ? '#fff' : '#333',
                      font: {
                        size: isSmallMobile ? 10 : (isMobile ? 12 : 14),
                        weight: 'bold'
                      }
                    },
                    ticks: {
                      color: window.globalTheme === 'dark' ? '#ccc' : '#666',
                      font: {
                        size: isSmallMobile ? 8 : (isMobile ? 9 : 11)
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
            marker.chartContainer = graphContainer; // Store reference to the container

            // Open popup with responsive sizing
            const popup = L.popup({
              offset: popupOffset,
              maxWidth: isSmallMobile ? 360 : (isMobile ? 480 : 650),
              maxHeight: isSmallMobile ? 320 : (isMobile ? 370 : 470),
              className: 'custom-popup mobile-optimized-popup',
              autoPan: true,
              autoPanPadding: [10, 10]
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

            // Add resize handler for mobile orientation changes
            const handleResize = () => {
              if (chart && chart.resize) {
                setTimeout(() => {
                  chart.resize();
                  console.log('Chart resized after orientation change');
                }, 200);
              }
            };

            window.addEventListener('resize', handleResize);
            window.addEventListener('orientationchange', handleResize);

            // Store cleanup function for the resize handlers
            marker._resizeCleanup = () => {
              window.removeEventListener('resize', handleResize);
              window.removeEventListener('orientationchange', handleResize);
            };
          });

          // Add keyboard accessibility AFTER the click handler
          marker.on('add', () => {
            // Small delay to ensure DOM is ready
            setTimeout(() => {
              const markerElement = marker.getElement();
              if (markerElement) {
                const tempLabel = markerElement.querySelector('.temp-label');
                if (tempLabel) {
                  // Add keyboard event listeners
                  tempLabel.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      console.log('Keyboard trigger for:', name); // Debug log
                      marker.fire('click'); // This should trigger the click handler
                    }
                  });

                  // Add focus styling
                  tempLabel.addEventListener('focus', () => {
                    tempLabel.style.outline = '3px solid #0066cc';
                    tempLabel.style.outlineOffset = '2px';
                  });

                  tempLabel.addEventListener('blur', () => {
                    tempLabel.style.outline = 'none';
                  });
                }
              }
            }, 100);
          });

          markersRef.current.push({ marker, tempC: t, name, lat, lon, timestamp: ts });
        }

        // Update the addMarkers function
        function addMarkers(items) {
          // First, separate user points from API points
          const apiPoints = [];
          const userPoints = [];
          
          items.forEach(item => {
            if (item.isUserPoint || (!item.siteName && !item.Label)) {
              userPoints.push(item);
            } else {
              apiPoints.push(item);
            }
          });
          
          // Helper function to calculate distance between two points in kilometers (Haversine formula)
          function calculateDistance(lat1, lon1, lat2, lon2) {
            const R = 6371; // Radius of the earth in km
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = 
              Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return R * c; // Distance in km
          }
          
          // Group user points that are within 1km of each other
          const groupedUserPoints = [];

          userPoints.forEach(point => {
            const lon = point.lng || point.lon || point.Longitude;
            const lat = point.lat || point.Latitude;
            const timestamp = new Date(point.timestamp || point.createdAt || point.created_at).getTime();
            
            // Find if this point belongs to any existing group
            let foundGroup = false;
            
            for (const group of groupedUserPoints) {
              const distance = calculateDistance(lat, lon, group.lat, group.lon);
              
              if (distance <= 1) { // Within 1km
                foundGroup = true;
                // Add this point to the group's historical points collection
                if (!group.historicalPoints) {
                  group.historicalPoints = [];
                }
                
                // Add this point to the historical collection
                group.historicalPoints.push({
                  temp: point.temp || point.Result,
                  timestamp: point.timestamp || point.createdAt || point.created_at
                });
                
                // Update the main display with the most recent point
                const groupTimestamp = new Date(group.timestamp || group.createdAt || group.created_at).getTime();
                
                if (!isNaN(timestamp) && !isNaN(groupTimestamp) && timestamp > groupTimestamp) {
                  // Update the group with this point's data but keep the group's position
                  group.temp = point.temp || point.Result;
                  group.timestamp = point.timestamp || point.createdAt || point.created_at;
                }
                
                // Increase the count regardless
                group.pointCount = (group.pointCount || 1) + 1;
                break;
              }
            }
            
            // If no matching group was found, create a new one
            if (!foundGroup) {
              groupedUserPoints.push({
                ...point,
                pointCount: 1,
                historicalPoints: [{
                  temp: point.temp || point.Result,
                  timestamp: point.timestamp || point.createdAt || point.created_at
                }]
              });
            }
          });
          
          // Add API points (these don't get grouped)
          apiPoints.forEach((item, i) => {
            addMarkerForItem(item, i);
          });
          
          // Add the grouped user points
          groupedUserPoints.forEach((item, i) => {
            addMarkerForItem(item, i, true);
          });
        }

        // Function to check if we have API points (official water data)
        function hasAPIPoints(items) {
          if (!items || items.length === 0) return false;
          // API points have siteName or Label, and are NOT user points
          return items.some(item => 
            (item.siteName || item.Label) && !item.isUserPoint
          );
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
              
              // Check if we have API points in cache
              if (hasAPIPoints(cachedItems)) {
                // We have API points, load immediately
                window.dispatchEvent(new Event('dataloaded'));
                addMarkers(cachedItems);
                setLoading(false); // Hide loading immediately
              } else {
                // No API points in cache, show loading and fetch fresh data
                console.log('⚠️ Cache has no API points, fetching fresh data...');
                setLoading(true);
                window.loadedAPI = true;
                // Continue to fetch fresh data below
              }
            } else if (cache) {
              console.log('📦 Cache expired, loading old data while fetching fresh...');
              const cachedItems = JSON.parse(cache);
              globalBeach = { items: cachedItems };
              addMarkers(cachedItems);
              setLoading(false);
            }

            // Step 2: Fetch fresh data if no valid cache OR no API points in cache
            if (!isCacheValid || (cache && !hasAPIPoints(JSON.parse(cache)))) {
              console.log('🔄 Fetching fresh data...');
              let officialData = { items: [] }, userData = { items: [] };

              try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://glow-backend-v4-0-0.onrender.com/api';
                
                const [officialRes, userRes] = await Promise.all([
                  fetch(`${API_URL}/water-data`),
                  fetch(`${API_URL}/userpoints`)
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
                  // Clean up resize handlers if they exist
                  if (marker._resizeCleanup) {
                    marker._resizeCleanup();
                  }
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
            window.loadedAPI = false; // Ensure loading state is cleared
          } catch (err) {
            console.error('fetch error →', err);
            // If no cache was loaded and fetch failed, still hide loading
            setLoading(false);
            window.loadedAPI = false;
          }
        }

        // Add water markers after map loads
        addLiveWaterTempMarkers();
      }
    };

    initMap();
    
    // Listen for unit changes using UnitManager
    const removeUnitListener = UnitManager.addUnitChangeListener((newUnit) => {
      setUnit(newUnit); // Update local state for legend
      
      markersRef.current.forEach(({ marker, tempC }) => {
      // 1) update the legend label
      const formattedTemp = formatTemperature(tempC, newUnit);
      const el = marker.getElement();
      if (el) {
        const valueSpan = el.querySelector('.temp-value');
        if (valueSpan) valueSpan.textContent = formattedTemp;
      }

      // 2) if this marker has a chart, update its data & options
      if (marker.chartInstance && marker.chartData) {
        const chart = marker.chartInstance;
        const newTimeBasedData = marker.chartData.map(d => ({
          x: new Date(d.timestamp),
          y: newUnit === 'F' ? (d.temp * 9) / 5 + 32 : d.temp
        }));
        chart.data.datasets[0].data = newTimeBasedData;
        chart.options.scales.y.title.text = `Temperature (°${newUnit})`;
        chart.options.scales.y.ticks.callback = val => `${val}°${newUnit}`;
        chart.update();
      }
    });
});

    // Listen for theme changes
    const onThemeChange = () => {
      // Update popup CSS dynamically
      updatePopupCSS();
      
      markersRef.current.forEach(({ marker }) => {
        // Update the graph if it exists
        if (marker.chartInstance) {
          const chart = marker.chartInstance; // Add this line - we need to reference the chart
          
          // Update chart colors based on new theme
          chart.options.plugins.title.color = window.globalTheme === 'dark' ? '#fff' : '#333';
          
          // Update tooltip colors
          chart.options.plugins.tooltip.backgroundColor = window.globalTheme === 'dark' ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)';
          chart.options.plugins.tooltip.titleColor = window.globalTheme === 'dark' ? '#fff' : '#000';
          chart.options.plugins.tooltip.bodyColor = window.globalTheme === 'dark' ? '#fff' : '#000';
          chart.options.plugins.tooltip.borderColor = window.globalTheme === 'dark' ? '#444' : '#ddd';
          
          // Update dataset colors
          chart.data.datasets[0].borderColor = window.globalTheme === 'dark' ? 'rgba(0, 217, 255, 1)' : 'rgba(75, 192, 192, 1)';
          chart.data.datasets[0].backgroundColor = window.globalTheme === 'dark' ? 'rgba(0, 217, 255, 0.1)' : 'rgba(75, 192, 192, 0.2)';
          chart.data.datasets[0].pointBackgroundColor = window.globalTheme === 'dark' ? 'rgba(0, 217, 255, 1)' : 'rgba(75, 192, 192, 1)';
          chart.data.datasets[0].pointBorderColor = window.globalTheme === 'dark' ? '#000' : '#fff';
          
          // Update axis colors
          chart.options.scales.x.title.color = window.globalTheme === 'dark' ? '#fff' : '#333';
          chart.options.scales.x.ticks.color = window.globalTheme === 'dark' ? '#ccc' : '#666';
          chart.options.scales.x.grid.color = window.globalTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
          
          chart.options.scales.y.title.color = window.globalTheme === 'dark' ? '#fff' : '#333';
          chart.options.scales.y.ticks.color = window.globalTheme === 'dark' ? '#ccc' : '#666';
          chart.options.scales.y.grid.color = window.globalTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

          // Update the popup container background and border if it exists
          if (marker.chartContainer) {
            marker.chartContainer.style.backgroundColor = window.globalTheme === 'dark' ? '#1a1a1a' : '#ffffff';
            marker.chartContainer.style.border = window.globalTheme === 'dark' ? '1px solid #333' : '1px solid #ddd';
            marker.chartContainer.style.boxShadow = window.globalTheme === 'dark' 
              ? '0 8px 32px rgba(0,0,0,0.5)' 
              : '0 8px 32px rgba(0,0,0,0.15)';
          }
          
          // Apply the updates
          chart.update();
        }
      });
    };

    // Add the theme event listener - THIS WAS MISSING!
    window.addEventListener('themechange', onThemeChange);

    // Add listener for when new points are added
    const handlePointAdded = (event) => {
      console.log('🔄 Point added, adding single marker to map...');
      const newPoint = event.detail;
      
      // Add the new point to globalBeach for HUDleftPoints
      if (globalBeach && globalBeach.items) {
        globalBeach.items.push(newPoint);
      }
      
      // Add single marker to the existing map
      addMarkerForItem(newPoint, markersRef.current.length, true);
      
      // Dispatch dataloaded event for HUDleftPoints to update
      window.dispatchEvent(new Event('dataloaded'));
    };
    
    window.addEventListener('pointAdded', handlePointAdded);

    // Function to update popup CSS dynamically
    function updatePopupCSS() {
      // Remove existing dynamic popup styles
      const existingStyle = document.querySelector('#dynamic-popup-styles');
      if (existingStyle) {
        existingStyle.remove();
      }

      // Create new style element
      const style = document.createElement('style');
      style.id = 'dynamic-popup-styles';
      
      const isDark = window.globalTheme === 'dark';
      
      style.textContent = `
        .leaflet-popup-content-wrapper {
          background-color: ${isDark ? '#1a1a1a' : '#ffffff'} !important;
          border: 1px solid ${isDark ? '#333' : '#ddd'} !important;
          box-shadow: ${isDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.15)'} !important;
          color: ${isDark ? '#fff' : '#000'} !important;
        }
        
        .leaflet-popup-tip {
          background-color: ${isDark ? '#1a1a1a' : '#ffffff'} !important;
          border: 1px solid ${isDark ? '#333' : '#ddd'} !important;
        }
        
        .leaflet-popup-close-button {
          color: ${isDark ? '#fff' : '#000'} !important;
        }
        
        .leaflet-popup-close-button:hover {
          color: ${isDark ? '#00d9ff' : '#666'} !important;
        }
      `;
      
      document.head.appendChild(style);
    }

    // Initialize popup styles
    updatePopupCSS();

    // Cleanup the event listeners on component unmount
    return () => {
      removeUnitListener(); // Clean up UnitManager listener
      window.removeEventListener('themechange', onThemeChange);
      window.removeEventListener('pointAdded', handlePointAdded);
      if (mapInstanceRef.current) {
        // Clean up ThemeManager listener
        if (mapInstanceRef.current._themeCleanup) {
          mapInstanceRef.current._themeCleanup();
        }
        mapInstanceRef.current.remove();
      }
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

  // Handle beach search by name or coordinates
  function handleSearch(selectedName, lat, lon, forcePopup = false) {
    if (!mapInstanceRef.current) return;
    
    // If direct coordinates are provided, use them
    if (lat && lon) {
      const map = mapInstanceRef.current;
      const targetZoom = 15;
      const offsetY = 150;
      const offsetX = 0;
      const targetLatLng = [lat, lon];
      
      // Find the marker that matches these coordinates before animation starts
      let targetMarker = null;
      markersRef.current.forEach(({marker, lat: markerLat, lon: markerLon}) => {
        // Use a larger tolerance for coordinate matching (0.005 is about 500m)
        if (Math.abs(markerLat - lat) < 0.005 && Math.abs(markerLon - lon) < 0.005) {
          console.log('Found matching marker at', markerLat, markerLon);
          targetMarker = marker;
        }
      });
      
      // Calculate offset points for smooth animation
      const currentZoom = map.getZoom();
      const pointAtCurrentZoom = map.project(targetLatLng, currentZoom);
      const offsetPointAtCurrentZoom = pointAtCurrentZoom.subtract([offsetX, offsetY]);
      const offsetLatLngAtCurrentZoom = map.unproject(offsetPointAtCurrentZoom, currentZoom);
      
      // First just pan to the location at the current zoom level
      map.once('moveend', function() {
        // After panning completes, smoothly zoom in
        map.once('zoomend', function() {
          // replace marker.openPopup() with marker.fire('click')
          markersRef.current.forEach(({ marker, lat: markerLat, lon: markerLon }) => {
            if (Math.abs(markerLat - lat) < 0.0001 && Math.abs(markerLon - lon) < 0.0001) {
              marker.fire('click');
            }
          });
        });
        
        // Animate zoom with a duration in ms
        map.flyTo(targetLatLng, targetZoom, {
          duration: 0.5, // seconds
          easeLinearity: 0.2
        });
      });
      
      // Start the sequence by panning
      map.panTo(offsetLatLngAtCurrentZoom, { 
        animate: true,
        duration: 0.75 // seconds
      });
      
      return;
    }
    
    // Otherwise continue with name-based search
    const term = selectedName ? selectedName.trim().toLowerCase() : '';
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
          // fire the click event so your click-handler builds the popup & chart
          match.marker.fire('click');
        });
        
        // Animate zoom with a duration in ms
        map.flyTo(offsetLatLng, targetZoom, {
          duration: 0.5,
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

  // new single useEffect to handle ALL filters
  useEffect(() => {
    function calculateDistance(lat1, lon1, lat2, lon2) {
      const R = 6371;
      const dLat = (lat2 - lat1)*Math.PI/180;
      const dLon = (lon2 - lon1)*Math.PI/180;
      const a = Math.sin(dLat/2)**2 +
                Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180) *
                Math.sin(dLon/2)**2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    }

    const handleFilter = e => {
      const { min, max, distanceMax, maxAge } = e.detail;
      const now = Date.now();

      // If distance filter is requested but no location, try to get it
      if (!isNaN(distanceMax) && !userLocationRef.current) {
        console.log('🔄 Distance filter requested, attempting to get location...');
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              userLocationRef.current = {
                lat: position.coords.latitude,
                lon: position.coords.longitude
              };
              console.log('📍 Got user location for filtering:', userLocationRef.current);
              // Re-trigger the filter with location now available
              handleFilter(e);
            },
            (error) => {
              console.warn('❌ Could not get location for distance filter:', error.message);
              alert('Location access is required for distance filtering. Please enable location permissions and try again.');
            }
          );
          return; // Exit early, will re-run once location is obtained
        } else {
          alert('Geolocation is not supported by this browser.');
          return;
        }
      }

      markersRef.current.forEach(({ marker, tempC, lat, lon, timestamp }) => {
        let keep = true;
        if (!isNaN(min) && tempC < min) keep = false;
        if (!isNaN(max) && tempC > max) keep = false;
        
        if (!isNaN(distanceMax) && userLocationRef.current) {
          const d = calculateDistance(
            userLocationRef.current.lat,
            userLocationRef.current.lon,
            lat, lon
          );
          if (d > distanceMax) keep = false;
        }
        
        if (!isNaN(maxAge) && timestamp) {
          const ageDays = (now - timestamp)/(1000*60*60*24);
          if (ageDays > maxAge) keep = false;
        }

        if (keep) {
          marker.addTo(mapInstanceRef.current);
        } else {
          mapInstanceRef.current.removeLayer(marker);
        }
      });
    };

    window.addEventListener('filterchange', handleFilter);
    return () => window.removeEventListener('filterchange', handleFilter);
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
        <span>{unit === 'F' ? '86°F' : '30°C'}</span>
        <span>{unit === 'F' ? '68°F' : '20°C'}</span>
        <span>{unit === 'F' ? '50°F' : '10°C'}</span>
        <span>{unit === 'F' ? '32°F' : '0°C'}</span>
      </div>
    </div>
  </div>

   
  
);
  
}

export { globalBeach }