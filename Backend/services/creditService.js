const User = require('../models/User');
const CreditTransaction = require('../models/CreditTransaction');
const { calculateCredits } = require('../utils/greenCredits');

// Recycle kora e-waste er weight onujayi user ke Green Credits dey.
// FR7 (submission confirm hole) ei function call korbe.
const awardCredits = async (userId, weightKg, options = {}) => {
  const { submissionId, description } = options;

  const credits = calculateCredits(weightKg);
  if (credits <= 0) {
    throw new Error('Weight is too small to earn Green Credits');
  }

  const userExists = await User.exists({ _id: userId });
  if (!userExists) {
    throw new Error('User not found');
  }

  // Same submission e duibar credit dewa jabe na
  if (submissionId) {
    const existing = await CreditTransaction.findOne({ submissionId });
    if (existing) {
      return { transaction: existing, alreadyAwarded: true };
    }
  }

  const transaction = await CreditTransaction.create({
    user: userId,
    weightKg,
    credits,
    submissionId,
    description,
  });

  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { greenCredits: credits, totalRecycledKg: weightKg } },
    { new: true }
  );

  return { transaction, user, alreadyAwarded: false };
};

module.exports = { awardCredits };
