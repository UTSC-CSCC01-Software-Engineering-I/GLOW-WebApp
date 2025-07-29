const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const waterDataRoutes = require('./routes/waterDataRoute');
const pointRoutes = require('./routes/pointRoutes');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize cron jobs
require('./cron/cronJob'); // Start periodic tasks

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', waterDataRoutes);
app.use('/api', require('./routes/waterDataRoute'));
app.use('/api', pointRoutes);

const pointController = require('./controllers/pointController');
app.post('/api/add-point', pointController.addPoint);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'GLOW Backend Server is running!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`GLOW Backend Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
