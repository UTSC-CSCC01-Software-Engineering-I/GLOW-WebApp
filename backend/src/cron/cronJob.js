const cron = require('node-cron');
const APIPoint = require('../models/APIPoint'); // Import your Mongoose model

// Schedule a task to run every 6 hours
cron.schedule('0 */6 * * *', async () => {
  console.log('⏰ Running periodic API call...');

  try {
    const API_KEY = process.env.OPENWATER_API_KEY;
    const BASE = 'https://openwaterdata.webcomand.com/ws/get';

    const CQL = `
      SELECT
        WaterSites.Label AS siteName,
        WaterSites.Longitude AS lng,
        WaterSites.Latitude  AS lat,
        Result              AS temp,
        CollectionTime      AS timestamp
      FROM DataSample
      WHERE
        WaterSites.City='Toronto' 
        AND WaterSites.Country='Canada'
        AND Measurement='Water Temperature'
      ORDER BY CollectionTime DESC
    `.trim();

    const url = `${BASE}?token=${API_KEY}&query=${encodeURIComponent(CQL)}`;
    console.log('🌐 Fetching URL:', url);

    // Use global fetch (Node 18+) or import dynamically
    let fetchFunction;
    if (typeof fetch !== 'undefined') {
      fetchFunction = fetch;
    } else {
      const { default: nodeFetch } = await import('node-fetch');
      fetchFunction = nodeFetch;
    }

    const response = await fetchFunction(url, { headers: { Accept: 'application/json' } });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`API returned status ${response.status}: ${errorText}`);
    }

    const json = await response.json();
    const items = json.contents || json.objects || json.results || json.data || [];

    const seen = new Set();
    const uniqueItems = [];
    items.forEach(item => {
      const name = item.siteName || item.Label;
      if (!seen.has(name)) {
        seen.add(name);
        uniqueItems.push(item);
      }
    });

    console.log(`🎯 Found ${uniqueItems.length} unique water sites`);

    // Save data to the database
    const savedItems = [];
    for (const item of uniqueItems) {
      const { siteName, lng, lat, temp, timestamp } = item;

      // Check if the last saved data point for this site is at least 6 hours old
      const lastEntry = await APIPoint.findOne({ beachName: siteName }).sort({ timestamp: -1 }); // Use beachName instead of siteName
      if (!lastEntry || new Date(timestamp) - new Date(lastEntry.timestamp) >= 6 * 60 * 60 * 1000) {
        const newEntry = new APIPoint({
          beachName: siteName, // Map siteName to beachName
          lng,
          lat,
          temp,
          timestamp,
        });
        await newEntry.save();
        savedItems.push(newEntry);
      }
    }

    console.log(`✅ Saved ${savedItems.length} new water site entries`);
  } catch (error) {
    console.error('💥 Error during periodic API call:', error);
  }
});