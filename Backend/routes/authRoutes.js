const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// Test route: login kora user er data dey
router.get('/me', protect, (req, res) => {
  res.json(req.user);
});

module.exports = router;