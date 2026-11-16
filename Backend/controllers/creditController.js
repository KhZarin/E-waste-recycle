const User = require('../models/User');
const CreditTransaction = require('../models/CreditTransaction');
const { CREDITS_PER_KG, calculateCredits } = require('../utils/greenCredits');
const { awardCredits } = require('../services/creditService');

const MAX_WEIGHT_KG = 10000;

// @route   GET /api/credits/calculate?weightKg=2.5
// @access  Private
// Credit preview: recycle korar age koto credit paabe
const calculatePreview = async (req, res) => {
  try {
    const weightKg = parseFloat(req.query.weightKg);

    if (!Number.isFinite(weightKg) || weightKg <= 0 || weightKg > MAX_WEIGHT_KG) {
      return res
        .status(400)
        .json({ message: 'Weight must be a number greater than 0' });
    }

    res.json({
      weightKg,
      creditsPerKg: CREDITS_PER_KG,
      credits: calculateCredits(weightKg),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/credits/summary
// @access  Private
// Login kora user er total credit, recycle kora weight ar history
const getMySummary = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const transactions = await CreditTransaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      greenCredits: user.greenCredits,
      totalRecycledKg: Number(user.totalRecycledKg.toFixed(3)),
      creditsPerKg: CREDITS_PER_KG,
      transactions: transactions.map((item) => ({
        _id: item._id,
        weightKg: item.weightKg,
        credits: item.credits,
        description: item.description,
        createdAt: item.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/credits/award
// @access  Private (admin only)
// FR7 toiri hoyar age FR8 test korar jonno, ar admin er manual credit dewar jonno
const awardToUser = async (req, res) => {
  try {
    const { email, weightKg, description } = req.body;
    const weight = Number(weightKg);

    if (!email) {
      return res.status(400).json({ message: 'User email is required' });
    }

    if (!Number.isFinite(weight) || weight <= 0 || weight > MAX_WEIGHT_KG) {
      return res
        .status(400)
        .json({ message: 'Weight must be a number greater than 0' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const result = await awardCredits(user._id, weight, {
      description: description || 'Credits added by admin',
    });

    res.status(201).json({
      message: 'Green Credits awarded',
      credits: result.transaction.credits,
      weightKg: result.transaction.weightKg,
      totalGreenCredits: result.user.greenCredits,
      totalRecycledKg: Number(result.user.totalRecycledKg.toFixed(3)),
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { calculatePreview, getMySummary, awardToUser };