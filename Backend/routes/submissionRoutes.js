const express = require('express');
const {
  createSubmission,
  getMySubmissions,
  cancelSubmission,
  getAllSubmissions,
  confirmSubmission,
  rejectSubmission,
} = require('../controllers/submissionController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, authorize('user'), createSubmission);
router.get('/mine', protect, getMySubmissions);
router.get('/', protect, authorize('partner', 'admin'), getAllSubmissions);
router.patch('/:id/cancel', protect, cancelSubmission);
router.patch(
  '/:id/confirm',
  protect,
  authorize('partner', 'admin'),
  confirmSubmission
);
router.patch(
  '/:id/reject',
  protect,
  authorize('partner', 'admin'),
  rejectSubmission
);

module.exports = router;