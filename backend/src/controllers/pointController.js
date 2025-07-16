const Point = require('../models/Point');

exports.addPoint = async (req, res) => {
  try {
    const { lat, lon, temp, label } = req.body;

    // Validation
    if (!lat || !lon || !temp || !label) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create and save to MongoDB
    const newPoint = new Point({ lat, lon, temp, label });
    await newPoint.save();

    return res.status(201).json({ message: 'Point added successfully', point: newPoint });
  } catch (err) {
    console.error('Error saving point:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
