// 1 kg e-waste = 50 Green Credits
const CREDITS_PER_KG = 50;

// Weight (kg) theke credit hishab kore. Valid na hole 0 dey
const calculateCredits = (weightKg) => {
  const kg = Number(weightKg);

  if (!Number.isFinite(kg) || kg <= 0) {
    return 0;
  }

  return Math.round(kg * CREDITS_PER_KG);
};

module.exports = { CREDITS_PER_KG, calculateCredits };
