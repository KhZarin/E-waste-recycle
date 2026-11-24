// Achievement level, Green Credits onujayi (1 kg e-waste = 50 credits)
const LEVELS = [
  {
    number: 1,
    name: 'Eco Starter',
    minCredits: 0,
    description: 'You have started your recycling journey.',
  },
  {
    number: 2,
    name: 'Green Recycler',
    minCredits: 500,
    description: 'You recycle regularly (about 10 kg of e-waste).',
  },
  {
    number: 3,
    name: 'Urban Miner',
    minCredits: 2000,
    description:
      'You help recover valuable materials from e-waste (about 40 kg).',
  },
];

// Credit theke level, porer level ar progress hishab kore
const getAchievementStatus = (credits) => {
  const parsed = Number(credits);
  const total = Number.isFinite(parsed) && parsed > 0 ? parsed : 0;

  let currentIndex = 0;
  LEVELS.forEach((level, index) => {
    if (total >= level.minCredits) {
      currentIndex = index;
    }
  });

  const current = LEVELS[currentIndex];
  const next = LEVELS[currentIndex + 1] || null;

  let progressPercent = 100;
  let creditsToNextLevel = 0;

  if (next) {
    const span = next.minCredits - current.minCredits;
    progressPercent = Math.min(
      100,
      Math.floor(((total - current.minCredits) / span) * 100)
    );
    creditsToNextLevel = next.minCredits - total;
  }

  return {
    currentLevel: current,
    nextLevel: next
      ? { number: next.number, name: next.name, minCredits: next.minCredits }
      : null,
    creditsToNextLevel,
    progressPercent,
    levels: LEVELS.map((level) => ({
      ...level,
      unlocked: total >= level.minCredits,
    })),
  };
};

module.exports = { LEVELS, getAchievementStatus };