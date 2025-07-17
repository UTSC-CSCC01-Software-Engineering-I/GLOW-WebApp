const express = require('express');
const router = express.Router();
const PointController = require('../controllers/pointController');

// GET /api/userpoints → return all points via controller
router.get('/userpoints', PointController.getPoints);

module.exports = router;