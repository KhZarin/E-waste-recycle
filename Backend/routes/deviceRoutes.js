const express = require('express');
const {
  getDevices,
  identifyDevice,
  analyzeDevice,
} = require('../controllers/deviceController');
const { aiIdentify } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getDevices);
router.post('/identify', protect, identifyDevice);
router.post('/ai-identify', protect, aiIdentify);
router.post('/analyze', protect, analyzeDevice);

module.exports = router;