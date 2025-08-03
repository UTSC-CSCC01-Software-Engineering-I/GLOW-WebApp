const User = require('../models/User');
const Point = require('../models/pointsModel');

exports.addPoint = async (req, res) => {
  try {
    const { lat, lon, temp } = req.body;

    if (!lat || !lon || !temp) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get logged-in user
    const user = await User.findById(req.userId).select('email');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newPoint = new Point({
      lat,
      lon,
      temp,
      user: {
        id: user._id,
        email: user.email
      }
    });

    await newPoint.save();

    return res.status(201).json({
      message: 'Point added successfully',
      point: newPoint
    });
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

exports.getUserPoints = async (req, res) => {
  try {
    // Get logged-in user
    const user = await User.findById(req.userId).select('email');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Find all points for this specific user
    const points = await Point.find({ 'user.email': user.email });

    // Format the response to match the frontend expectations
    const formattedPoints = points.map(point => ({
      _id: point._id,
      lat: point.lat,
      lon: point.lon,
      temp: point.temp,
      timestamp: point.createdAt,
      source: 'user'
    }));

    return res.json({ 
      success: true, 
      data: formattedPoints 
    });
  } catch (err) {
    console.error('Error fetching user points:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

exports.editPoint = async (req, res) => {
  try {
    const { pointId } = req.params;
    const { lat, lon, temp } = req.body;

    if (!lat || !lon || !temp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: lat, lon, temp' 
      });
    }

    // Get logged-in user
    const user = await User.findById(req.userId).select('email');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Find the point and verify ownership
    const point = await Point.findOne({ 
      _id: pointId, 
      'user.email': user.email 
    });

    if (!point) {
      return res.status(404).json({ 
        success: false, 
        message: 'Point not found or you do not have permission to edit it' 
      });
    }

    // Update the point
    point.lat = lat;
    point.lon = lon;
    point.temp = temp;
    
    await point.save();

    return res.json({ 
      success: true, 
      message: 'Point updated successfully',
      point: {
        _id: point._id,
        lat: point.lat,
        lon: point.lon,
        temp: point.temp,
        timestamp: point.createdAt,
        source: 'user'
      }
    });
  } catch (err) {
    console.error('Error editing point:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

exports.deletePoint = async (req, res) => {
  try {
    const { pointId } = req.params;

    // Get logged-in user
    const user = await User.findById(req.userId).select('email');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Find and delete the point, verifying ownership
    const deletedPoint = await Point.findOneAndDelete({ 
      _id: pointId, 
      'user.email': user.email 
    });

    if (!deletedPoint) {
      return res.status(404).json({ 
        success: false, 
        message: 'Point not found or you do not have permission to delete it' 
      });
    }

    return res.json({ 
      success: true, 
      message: 'Point deleted successfully' 
    });
  } catch (err) {
    console.error('Error deleting point:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};
