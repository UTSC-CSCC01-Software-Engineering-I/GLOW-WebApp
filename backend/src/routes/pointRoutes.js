const express = require('express');
const router = express.Router();
const PointController = require('../controllers/pointController');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/userpoints → return all points
router.get('/userpoints', PointController.getPoints);

// POST /api/add-point → add a new point (protected)
router.post('/add-point', authMiddleware, PointController.addPoint);

module.exports = router;
