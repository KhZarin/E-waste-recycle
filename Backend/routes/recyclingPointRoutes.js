const express = require('express');
const {
  getNearbyPoints,
  getAllPoints,
  getPointById,
} = require('../controllers/recyclingPointController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/nearby', protect, getNearbyPoints);
router.get('/', protect, getAllPoints);
router.get('/:id', protect, getPointById);

module.exports = router;