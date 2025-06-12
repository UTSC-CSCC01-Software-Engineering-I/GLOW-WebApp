// filepath: backend/src/routes/waterDataRoute.js
const express = require('express');
const router = express.Router();

router.get('/water-data', async (req, res) => {
  try {
    const API_KEY = process.env.OPENWATER_API_KEY;
    const BASE = 'https://openwaterdata.webcomand.com/ws/get';
    
    const CQL = `
      SELECT
        WaterSites.Label AS siteName,
        WaterSites.Longitude AS lng,
        WaterSites.Latitude  AS lat,
        Result              AS temp
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

    const response = await fetchFunction(url, { 
      headers: { Accept: 'application/json' } 
    });
    
    console.log('📡 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`API returned status ${response.status}: ${errorText}`);
    }
    
    const json = await response.json();
    console.log('✅ API Response keys:', Object.keys(json));
    
    // Transform the data to match your frontend expectations
    const items = json.contents || json.objects || json.results || json.data || [];
    console.log('🔍 Found items array:', items.length, 'items');
    
    // Dedupe by siteName (keep only first occurrence)
    const seen = new Set();
    const uniqueItems = [];
    items.forEach(item => {
      const name = item.siteName || item.Label;
      if (!seen.has(name)) {
        seen.add(name);
        uniqueItems.push(item);
      }
    });

    console.log(`🎯 Returning ${uniqueItems.length} unique water sites`);
    res.json({ items: uniqueItems });
  } catch (error) {
    console.error('💥 Water data error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch water data',
      details: error.message 
    });
  }
});

module.exports = router;