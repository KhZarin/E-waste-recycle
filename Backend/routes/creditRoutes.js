const express = require('express');
const {
  calculatePreview,
  getMySummary,
  awardToUser,
} = require('../controllers/creditController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/calculate', protect, calculatePreview);
router.get('/summary', protect, getMySummary);
router.post('/award', protect, authorize('admin'), awardToUser);

module.exports = router;