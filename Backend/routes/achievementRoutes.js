const express = require('express');
const { getMyAchievements } = require('../controllers/achievementController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/me', protect, getMyAchievements);

module.exports = router;