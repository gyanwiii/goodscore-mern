import { useEffect, useState } from "react";
import { drawApi } from "../../api/draws";
import { useToast } from "../../context/ToastContext";
import { fmtMoney } from "../../utils/format";

const TIER_LABELS = { 5: "5-number match", 4: "4-number match", 3: "3-number match" };

export default function Draws() {
  const [draws, setDraws] = useState([]);
  const toast = useToast();

  function load() { drawApi.listAll().then(setDraws); }
  useEffect(load, []);

  const draft = draws.find((d) => d.status !== "published");
  const published = draws.filter((d) => d.status === "published");

  async function createDraft() {
    try { await drawApi.createDraft(); load(); }
    catch (err) { toast(err.message); }
  }
  async function changeType(type) { await drawApi.setType(draft._id, type); load(); }
  async function runSim() { await drawApi.simulate(draft._id); toast("Simulation run — review before publishing."); load(); }
  async function doPublish() { await drawApi.publish(draft._id); toast("Draw published! Winners can now claim. 🎉"); load(); }
  async function doDiscard() { await drawApi.discard(draft._id); load(); }

  return (
    <div className="reveal">
      <div className="card" style={{ marginBottom: 18 }}>
        {!draft ? (
          <>
            <h3>🎟️ Create this cycle's draw</h3>
            <p>A new draft draw will be labelled automatically from today's date.</p>
            <button className="btn btn-primary btn-sm" onClick={createDraft}>Create draft draw</button>
          </>
        ) : (
          <>
            <h3>🎟️ {draft.label} — draft</h3>
            <div className="field" style={{ maxWidth: 320 }}>
              <label>Draw type</label>
              <select value={draft.type} onChange={(e) => changeType(e.target.value)}>
                <option value="random">🎲 Random</option>
                <option value="algorithmic">⚙️ Algorithmic — weighted by score frequency</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btn btn-gold btn-sm" onClick={runSim}>Run simulation</button>
              <button className="btn btn-primary btn-sm" disabled={!draft.numbers} onClick={doPublish}>Publish results</button>
              <button className="btn btn-danger btn-sm" onClick={doDiscard}>Discard draft</button>
            </div>
          </>
        )}
      </div>

      {draft?.numbers && (
        <div className="card" style={{ marginBottom: 18 }}>
          <h3>Simulation preview</h3>
          <div className="balls">{draft.numbers.map((n) => <div className="ball" key={n}>{n}</div>)}</div>
          <div className="stat-row" style={{ marginTop: 16 }}>
            <div className="stat"><div className="num mono">{fmtMoney(draft.poolTotal)}</div><div className="lbl">Total pool</div></div>
            {[5, 4, 3].map((size) => (
              <div className="stat" key={size}><div className="num mono">{fmtMoney(draft.tierPools?.[size] || 0)}</div><div className="lbl">{TIER_LABELS[size]} pool</div></div>
            ))}
          </div>
          <table>
            <thead><tr><th>Winner</th><th>Tier</th><th>Amount</th></tr></thead>
            <tbody>
              {draft.winners.length ? draft.winners.map((w) => (
                <tr key={w._id}><td>{w.user?.name || "—"}</td><td>{w.tier}-match</td><td className="mono">{fmtMoney(w.amount)}</td></tr>
              )) : (
                <tr><td colSpan={3}>No winners this round — the 5-match share of {fmtMoney(draft.jackpotCarryOut || 0)} will roll over.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="card">
        <h3>Draw history</h3>
        {!published.length && <div className="empty">No published draws yet.</div>}
        {published.map((d) => (
          <div className="card" style={{ background: "var(--panel-2)", marginTop: 10 }} key={d._id}>
            <strong>{d.label}</strong> — {fmtMoney(d.poolTotal)} pool, {d.winners.length} winner(s)
            <div className="balls" style={{ marginTop: 8 }}>{d.numbers.map((n) => <div className="ball small" key={n}>{n}</div>)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
