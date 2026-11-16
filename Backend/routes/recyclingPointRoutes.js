const express = require('express');
const { getNearbyPoints } = require('../controllers/recyclingPointController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/nearby', protect, getNearbyPoints);

module.exports = router;