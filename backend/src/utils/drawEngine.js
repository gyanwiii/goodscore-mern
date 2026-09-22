const { NUM_MIN, NUM_MAX, NUMBERS_DRAWN, TIERS, PLAN_PRICE, PRIZE_POOL_RATE } = require("./constants");

/* Design decision (see README "Design decisions"):
 * A subscriber's own latest ≤5 Stableford scores ARE their ticket numbers.
 * Draws pull 5 unique numbers from 1–45 (the score range) and match them
 * against each active subscriber's own scores. */

function activeSubscribers(users) {
  return users.filter((u) => u.role === "user" && u.status === "active");
}

function scoreFrequencyWeights(users) {
  const weights = new Array(NUM_MAX + 1).fill(0.15); // small base weight so every number stays possible
  activeSubscribers(users).forEach((u) => {
    (u.scores || []).forEach((s) => {
      weights[s.score] = (weights[s.score] || 0) + 1;
    });
  });
  return weights;
}

function weightedSampleNoReplacement(weights, count) {
  const pool = [];
  for (let n = NUM_MIN; n <= NUM_MAX; n++) pool.push({ n, w: weights[n] });
  const result = [];
  for (let i = 0; i < count && pool.length; i++) {
    const total = pool.reduce((s, p) => s + p.w, 0);
    let r = Math.random() * total;
    let idx = 0;
    for (; idx < pool.length; idx++) {
      r -= pool[idx].w;
      if (r <= 0) break;
    }
    idx = Math.min(idx, pool.length - 1);
    result.push(pool[idx].n);
    pool.splice(idx, 1);
  }
  return result.sort((a, b) => a - b);
}

function randomSampleNoReplacement(count) {
  const pool = [];
  for (let n = NUM_MIN; n <= NUM_MAX; n++) pool.push(n);
  const result = [];
  for (let i = 0; i < count && pool.length; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    result.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return result.sort((a, b) => a - b);
}

function drawNumbers(users, type) {
  return type === "algorithmic"
    ? weightedSampleNoReplacement(scoreFrequencyWeights(users), NUMBERS_DRAWN)
    : randomSampleNoReplacement(NUMBERS_DRAWN);
}

function poolTotalFor(users) {
  const total = activeSubscribers(users).reduce((sum, u) => {
    const fee = PLAN_PRICE[u.plan] || 0;
    const charityCut = fee * ((u.charityPercent || 0) / 100);
    return sum + (fee - charityCut) * PRIZE_POOL_RATE;
  }, 0);
  return Math.round(total * 100) / 100;
}

/**
 * @param {Array} users        plain user objects (role, status, plan, charityPercent, scores, _id)
 * @param {String} type        'random' | 'algorithmic'
 * @param {Number} priorCarry  unclaimed 5-match share carried in from the previous published draw
 */
function computeDrawOutcome(users, type, priorCarry) {
  const numbers = drawNumbers(users, type);
  const base = poolTotalFor(users);
  const carry = priorCarry || 0;

  // Each tier's share comes out of this cycle's fresh contributions ("base").
  // An unclaimed 5-match jackpot rides forward and adds ONLY to the next
  // 5-match tier pool — it is not re-shared across all three tiers.
  const tierPools = {};
  TIERS.forEach((t) => (tierPools[t.size] = Math.round(base * t.share * 100) / 100));
  tierPools[5] = Math.round((tierPools[5] + carry) * 100) / 100;
  const poolTotal = Math.round((tierPools[3] + tierPools[4] + tierPools[5]) * 100) / 100;

  const matchesByTier = { 5: [], 4: [], 3: [] };
  activeSubscribers(users).forEach((u) => {
    const userNums = new Set((u.scores || []).map((s) => s.score));
    const matchCount = numbers.filter((n) => userNums.has(n)).length;
    if (matchCount >= 3) matchesByTier[matchCount].push(u._id);
  });

  const winners = [];
  let jackpotCarryOut = 0;
  TIERS.forEach((t) => {
    const winnersInTier = matchesByTier[t.size];
    if (winnersInTier.length === 0) {
      if (t.rollover) jackpotCarryOut = tierPools[t.size];
      return;
    }
    const share = Math.round((tierPools[t.size] / winnersInTier.length) * 100) / 100;
    winnersInTier.forEach((userId) =>
      winners.push({ user: userId, tier: t.size, amount: share, proofUrl: null, payStatus: "pending" })
    );
  });

  return { numbers, poolTotal, tierPools, winners, jackpotCarryOut };
}

module.exports = {
  activeSubscribers,
  scoreFrequencyWeights,
  drawNumbers,
  poolTotalFor,
  computeDrawOutcome,
};
