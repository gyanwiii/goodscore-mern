// Shared constants — see README.md "Design decisions" for why these values
// were chosen for the parts of the PRD that were left ambiguous.

const NUM_MIN = 1;
const NUM_MAX = 45; // matches the Stableford score range (§05)
const NUMBERS_DRAWN = 5;

const TIERS = [
  { size: 5, share: 0.4, label: "5-number match", rollover: true },
  { size: 4, share: 0.35, label: "4-number match", rollover: false },
  { size: 3, share: 0.25, label: "3-number match", rollover: false },
];

const PLAN_PRICE = { monthly: 19.99, yearly: 199 };

// % of (fee - charity cut) that an active subscriber contributes to the
// monthly prize pool. The PRD does not fix this number — see README.
const PRIZE_POOL_RATE = 0.15;

module.exports = { NUM_MIN, NUM_MAX, NUMBERS_DRAWN, TIERS, PLAN_PRICE, PRIZE_POOL_RATE };
