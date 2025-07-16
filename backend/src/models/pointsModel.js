const mongoose = require('mongoose');

const PointSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
  temp: { type: Number, required: true },
  label: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Point', PointSchema);
