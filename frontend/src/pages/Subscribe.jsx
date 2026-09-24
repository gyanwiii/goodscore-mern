import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { charityApi } from "../api/charities";
import { subscriptionApi } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { PLAN_PRICE, PRIZE_POOL_RATE, fmtMoney } from "../utils/format";

export default function Subscribe() {
  const { user, applySession } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [charities, setCharities] = useState([]);
  const [plan, setPlan] = useState("monthly");
  const [charityId, setCharityId] = useState(location.state?.charityId || "");
  const [pct, setPct] = useState(10);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const canceled = params.get("canceled") === "1";

  useEffect(() => {
    charityApi.list().then((list) => {
      setCharities(list);
      if (!charityId && list.length) setCharityId(list[0]._id);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fee = PLAN_PRICE[plan];
  const charityCut = fee * (pct / 100);
  const poolCut = (fee - charityCut) * PRIZE_POOL_RATE;

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!user && (!name || !email || !password)) {
      setError("Fill in your name, email and password.");
      return;
    }
    setBusy(true);
    try {
      const { checkoutUrl, token, user: u } = await subscriptionApi.checkout({
        plan, charity: charityId, charityPercent: pct, name, email, password,
      });
      // Keep the session alive across the redirect to Stripe and back —
      // the plan itself only activates once payment is confirmed.
      applySession({ token, user: u });
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <section className="container" style={{ paddingTop: 48 }}>
      <div className="section-head"><h2>Subscribe to GoodScore</h2></div>
      {canceled && (
        <div className="card" style={{ borderLeft: "3px solid var(--coral)", marginBottom: 20 }}>
          Checkout was canceled — no charge was made. Pick your plan below whenever you're ready.
        </div>
      )}
      <form onSubmit={submit} className="grid-2" style={{ alignItems: "start" }}>
        <div className="card reveal">
          <h3 style={{ marginBottom: 14 }}>1 · Choose your plan</h3>
          <div className="field">
            <label><input type="radio" name="plan" checked={plan === "monthly"} onChange={() => setPlan("monthly")} style={{ width: "auto", marginRight: 8 }} />Monthly — $19.99/mo</label>
          </div>
          <div className="field">
            <label><input type="radio" name="plan" checked={plan === "yearly"} onChange={() => setPlan("yearly")} style={{ width: "auto", marginRight: 8 }} />Yearly — $199/yr <span className="tag">save 17%</span></label>
          </div>

          <h3 style={{ margin: "20px 0 14px" }}>2 · Pick your charity</h3>
          <div className="field">
            <select value={charityId} onChange={(e) => setCharityId(e.target.value)}>
              {charities.map((c) => <option key={c._id} value={c._id}>{c.emoji} {c.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Your contribution: <strong>{pct}%</strong> of your subscription (min. 10%)</label>
            <input type="range" min="10" max="100" step="5" value={pct} onChange={(e) => setPct(Number(e.target.value))} />
          </div>

          {!user && (
            <>
              <h3 style={{ margin: "20px 0 10px" }}>3 · Account details</h3>
              <div className="field"><label>Full name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jordan Lee" /></div>
              <div className="field"><label>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></div>
              <div className="field"><label>Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" /></div>
            </>
          )}
          {user && <p>You're logged in as <strong>{user.name}</strong> ({user.email}). Completing checkout will update your existing plan.</p>}
          {error && <div className="error-msg">{error}</div>}
        </div>

        <div className="card reveal">
          <h3 style={{ marginBottom: 14 }}>3 · Payment</h3>
          <p className="help" style={{ marginTop: 0 }}>
            You'll enter your card on Stripe's secure checkout page next — GoodScore never sees or stores your
            card details. Your plan activates automatically the moment Stripe confirms the payment.
          </p>
          <div className="card" style={{ background: "var(--panel-2)", margin: "16px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span>Subscription</span><span className="mono">{fmtMoney(fee)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, color: "var(--sage)" }}><span>→ to charity</span><span className="mono">{fmtMoney(charityCut)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--gold)" }}><span>→ to prize pool</span><span className="mono">{fmtMoney(poolCut)}</span></div>
          </div>
          <button className="btn btn-gold" style={{ width: "100%" }} disabled={busy}>
            {busy ? "Redirecting to Stripe…" : "Continue to payment 💳"}
          </button>
          <p className="help" style={{ textAlign: "center", marginTop: 10, marginBottom: 0 }}>
            Test mode: use card 4242 4242 4242 4242, any future expiry, any CVC.
          </p>
        </div>
      </form>
    </section>
  );
}
