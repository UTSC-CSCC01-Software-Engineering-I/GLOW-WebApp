const mongoose = require('mongoose');
const APIPoint = require('../models/APIPoint'); // Import your Mongoose model
require('dotenv').config(); // Load environment variables

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/glow_dev', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Connected to MongoDB');
}).catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Test data
const testData = [
  {
    beachName: 'Cherry Beach',
    lng: -79.343593894038,
    lat: 43.636926181088,
    temp: 22.5,
    timestamp: new Date(),
  },
  {
    beachName: 'Cherry Beach',
    lng: -79.343593894038,
    lat: 43.636926181088,
    temp: 21.8,
    timestamp: new Date(new Date().setDate(new Date().getDate() - 1)), // 1 day ago
  },
  {
    beachName: 'Cherry Beach',
    lng: -79.343593894038,
    lat: 43.636926181088,
    temp: 20.3,
    timestamp: new Date(new Date().setDate(new Date().getDate() - 2)), // 2 days ago
  },
  {
    beachName: 'Woodbine Beach',
    lng: -79.304827759035,
    lat: 43.662465872353,
    temp: 19.5,
    timestamp: new Date(new Date().setDate(new Date().getDate() - 3)), // 3 days ago
  },
];

// Insert test data
async function insertTestData() {
  try {
    await APIPoint.insertMany(testData);
    console.log('✅ Test data inserted successfully');
  } catch (error) {
    console.error('❌ Error inserting test data:', error);
  } finally {
    mongoose.connection.close();
  }
}

insertTestData();