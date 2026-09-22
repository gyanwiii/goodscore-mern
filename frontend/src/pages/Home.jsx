import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { charityApi } from "../api/charities";
import { drawApi } from "../api/draws";
import FlipNumber from "../components/FlipNumber";
import { fmtMoney } from "../utils/format";

export default function Home() {
  const [charities, setCharities] = useState([]);
  const [draws, setDraws] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([charityApi.list(), drawApi.listPublished()])
      .then(([c, d]) => {
        setCharities(c);
        setDraws(d);
      })
      .catch((e) => setError(e.message));
  }, []);

  const latestDraw = draws[0];
  const spotlight = charities[0];

  return (
    <>
      <section className="hero container">
        <div className="hero-grid reveal">
          <div>
            <div className="tag">🏌️ Stableford scoring · monthly draws · real charities</div>
            <h1>Play your round.<br />Fund the cause.<br />Win a share of the pool.</h1>
            <p className="lede">
              GoodScore turns your last five rounds into a monthly shot at a prize pool — while 10%+ of every
              subscription goes straight to a charity you pick. No plaid, no clichés, just your scores and your cause.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary" to="/subscribe">Subscribe &amp; enter this month 🎟️</Link>
              <Link className="btn btn-ghost" to="/charities">Browse charities 🎗️</Link>
            </div>
          </div>
          <div className="ticker">
            <div className="ticker-row">
              <span className="ticker-label">Latest published pool</span>
              <FlipNumber text={latestDraw ? fmtMoney(latestDraw.poolTotal) : "$0.00"} />
            </div>
            <div className="ticker-row">
              <span className="ticker-label">Charities on the platform</span>
              <FlipNumber text={String(charities.length)} />
            </div>
            <div className="ticket-divider"></div>
            <div className="ticker-row">
              <span className="ticker-label">Draws published so far</span>
              <FlipNumber text={String(draws.length)} />
            </div>
          </div>
        </div>
        {error && <p className="error-msg">{error} — is the API running?</p>}
      </section>

      <section className="container">
        <div className="section-head">
          <h2>Six things this platform does<br />for the people who use it.</h2>
        </div>
        <div className="grid-3">
          <div className="card obj-card"><div className="obj-kicker">Engine</div><h3>💳 Subscribe once, count every month</h3><p>Monthly or yearly plans, Stripe-style checkout, automatic renewal and lapse handling.</p></div>
          <div className="card obj-card"><div className="obj-kicker">Experience</div><h3>⛳ Log a round in seconds</h3><p>Enter a Stableford score (1–45) with a date. Your latest five are always what's live.</p></div>
          <div className="card obj-card"><div className="obj-kicker">Engine</div><h3>🎟️ A draw that isn't just luck</h3><p>Random or score-weighted algorithmic draws, simulated before publishing, jackpots roll over.</p></div>
          <div className="card obj-card"><div className="obj-kicker">Integration</div><h3>🎗️ Charity built into the fee</h3><p>At least 10% of every subscription goes to a charity you pick — you can always give more.</p></div>
          <div className="card obj-card"><div className="obj-kicker">Control</div><h3>🛠️ Admin sees everything</h3><p>Users, draws, charities, winner payouts, and reporting in one control room.</p></div>
          <div className="card obj-card"><div className="obj-kicker">Design</div><h3>✨ Feels nothing like a golf site</h3><p>Built around the numbers and the cause, not fairways and plaid.</p></div>
        </div>
      </section>

      {spotlight && (
        <section className="container">
          <div className="section-head">
            <h2>Featured cause this month</h2>
            <Link className="btn btn-ghost btn-sm" to="/charities">See all charities</Link>
          </div>
          <div className="card charity-card">
            <div className="charity-emoji" style={{ width: 64, height: 64, fontSize: "2rem" }}>{spotlight.emoji}</div>
            <h3>{spotlight.name}</h3>
            <span className="tag">{spotlight.cause}</span>
            <p>{spotlight.blurb}</p>
            <Link className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-start", textDecoration: "none" }} to={`/charities?open=${spotlight._id}`}>
              View profile
            </Link>
          </div>
        </section>
      )}

      <section className="container">
        <div className="section-head"><h2>How the monthly draw works</h2></div>
        <div className="card">
          <div className="balls">
            {[7, 14, 22, 31, 40].map((n) => <div className="ball" key={n}>{n}</div>)}
          </div>
          <p style={{ marginTop: 16 }}>
            Every active subscriber's ticket <em>is</em> their latest five Stableford scores. Each month we draw five
            numbers between 1 and 45 — match 3, 4 or 5 of your own scores against them and you share that tier's pool.
            In <strong>algorithmic</strong> mode, numbers that more players have actually scored are more likely to be
            drawn, so the draw literally reflects the field's performance that month.
          </p>
        </div>
      </section>
    </>
  );
}
