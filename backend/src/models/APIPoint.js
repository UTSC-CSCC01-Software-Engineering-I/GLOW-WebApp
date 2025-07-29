const mongoose = require('mongoose');

const APIPointSchema = new mongoose.Schema({
  beachName: { type: String, required: true },
  lng: { type: Number, required: true },
  lat: { type: Number, required: true },
  temp: { type: Number, required: true },
  timestamp: { type: Date, required: true },
}, { collection: 'APIPoints' } // Explicitly set the collection name
);

module.exports = mongoose.model('APIPoint', APIPointSchema);