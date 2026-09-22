export const PLAN_PRICE = { monthly: 19.99, yearly: 199 };
export const PRIZE_POOL_RATE = 0.15;

export function fmtMoney(n) {
  return "$" + Number(n || 0).toFixed(2);
}
export function fmtDate(d) {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
