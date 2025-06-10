   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>Interactive Map</title>
       <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
       <style>
           #map {
               height: 100vh; /* Full height */
           }
       </style>
   </head>
   <body>
       <div id="map"></div>
       <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
       <script>
           // Initialize the map
           const map = L.map('map').setView([51.505, -0.09], 13); // Set initial view (latitude, longitude, zoom level)

           // Add OpenStreetMap tiles
           L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
               maxZoom: 19,
           }).addTo(map);

           // Add a marker
           L.marker([51.5, -0.09]).addTo(map)
               .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
               .openPopup();
       </script>
   </body>
   </html>