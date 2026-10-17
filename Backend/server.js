require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const deviceRoutes = require('./routes/deviceRoutes');

const app = express();

// Database connect
connectDB();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json({ limit: '10mb' }));

// Test route
app.get('/', (req, res) => {
  res.send('E-Waste API is running');
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});