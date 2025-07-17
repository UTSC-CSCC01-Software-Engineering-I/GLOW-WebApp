const Point = require('../models/pointsModel');

exports.addPoint = async (req, res) => {
  try {
    const { lat, lon, temp } = req.body;

    if (!lat || !lon || !temp) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newPoint = new Point({ lat, lon, temp });
    await newPoint.save();

    return res.status(201).json({ message: 'Point added successfully', point: newPoint });
  } catch (err) {
    console.error('Error saving point:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getPoints = async (req, res) => {
  try {
    const points = await Point.find({});

    // Tag each point with `source: 'user'`
    const withSource = points.map(p => ({
      ...p.toObject(),
      source: 'user'
    }));

    return res.json({ items: withSource });
  } catch (err) {
    console.error('Error fetching user points:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
