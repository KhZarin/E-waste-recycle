require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const recyclingPointRoutes = require('./routes/recyclingPointRoutes');
const creditRoutes = require('./routes/creditRoutes');
const submissionRoutes = require('./routes/submissionRoutes');

const app = express();

// Database connect
connectDB();

// Middleware
// Development e localhost er je kono port theke request allow
app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        origin === process.env.CLIENT_URL ||
        /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)
      ) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
  })
);
app.use(express.json({ limit: '10mb' }));

// Test route
app.get('/', (req, res) => {
  res.send('E-Waste API is running');
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/recycling-points', recyclingPointRoutes);
app.use('/api/credits', creditRoutes);
app.use('/api/submissions', submissionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});