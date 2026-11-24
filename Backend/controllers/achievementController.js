const User = require('../models/User');
const { getAchievementStatus } = require('../utils/achievements');

// @route   GET /api/achievements/me
// @access  Private
// FR9: login kora user er credit, level, porer level ar progress
const getMyAchievements = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const greenCredits = user.greenCredits || 0;

    res.json({
      greenCredits,
      totalRecycledKg: Number((user.totalRecycledKg || 0).toFixed(3)),
      ...getAchievementStatus(greenCredits),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMyAchievements };