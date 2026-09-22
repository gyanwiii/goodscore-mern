import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { charityApi } from "../api/charities";
import { subscriptionApi } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { PLAN_PRICE, PRIZE_POOL_RATE, fmtMoney } from "../utils/format";

export default function Subscribe() {
  const { user, applySession } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const [charities, setCharities] = useState([]);
  const [plan, setPlan] = useState("monthly");
  const [charityId, setCharityId] = useState(location.state?.charityId || "");
  const [pct, setPct] = useState(10);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [card, setCard] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

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
    if (card.replace(/\s/g, "").length < 12) {
      setError("Enter a card number (try 4242 4242 4242 4242 — this is a simulated gateway).");
      return;
    }
    if (!user && (!name || !email || !password)) {
      setError("Fill in your name, email and password.");
      return;
    }
    setBusy(true);
    try {
      const { token, user: u } = await subscriptionApi.subscribe({
        plan, charity: charityId, charityPercent: pct, card, name, email, password,
      });
      applySession({ token, user: u });
      toast("Subscribed! Welcome to GoodScore 🎉");
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="container" style={{ paddingTop: 48 }}>
      <div className="section-head"><h2>Subscribe to GoodScore</h2></div>
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
          {user && <p>You're logged in as <strong>{user.name}</strong> ({user.email}). This will update your existing plan.</p>}
          {error && <div className="error-msg">{error}</div>}
        </div>

        <div className="card reveal">
          <h3 style={{ marginBottom: 14 }}>4 · Payment</h3>
          <p className="help" style={{ marginTop: 0 }}>Simulated checkout for this build — wire up Stripe using the notes in README.md before going live.</p>
          <div className="field"><label>Card number</label><input type="text" value={card} onChange={(e) => setCard(e.target.value)} placeholder="4242 4242 4242 4242" maxLength={19} /></div>
          <div className="grid-2">
            <div className="field"><label>Expiry</label><input type="text" value={exp} onChange={(e) => setExp(e.target.value)} placeholder="MM/YY" maxLength={5} /></div>
            <div className="field"><label>CVC</label><input type="text" value={cvc} onChange={(e) => setCvc(e.target.value)} placeholder="123" maxLength={4} /></div>
          </div>
          <div className="card" style={{ background: "var(--panel-2)", margin: "16px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span>Subscription</span><span className="mono">{fmtMoney(fee)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, color: "var(--sage)" }}><span>→ to charity</span><span className="mono">{fmtMoney(charityCut)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--gold)" }}><span>→ to prize pool</span><span className="mono">{fmtMoney(poolCut)}</span></div>
          </div>
          <button className="btn btn-gold" style={{ width: "100%" }} disabled={busy}>{busy ? "Processing…" : "Confirm & subscribe 🎉"}</button>
        </div>
      </form>
    </section>
  );
}
