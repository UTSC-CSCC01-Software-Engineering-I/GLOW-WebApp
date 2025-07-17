const mongoose = require('mongoose');

const PointSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
  temp: { type: Number, required: true },
  source: { type: String, default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserPoints', PointSchema);
