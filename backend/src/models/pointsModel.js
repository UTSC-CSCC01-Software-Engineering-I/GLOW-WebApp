const mongoose = require('mongoose');

const PointSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
  temp: { type: Number, required: true },
  source: { type: String, default: 'user' },
  createdAt: { type: Date, default: Date.now },
  user: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    email: { type: String, required: true }
  }
});

module.exports = mongoose.model('UserPoints', PointSchema);
