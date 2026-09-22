import { useState } from "react";
import { userApi } from "../../api/auth";
import { useToast } from "../../context/ToastContext";
import { fmtDate, todayStr } from "../../utils/format";

export default function Scores({ me, reload }) {
  const [date, setDate] = useState("");
  const [score, setScore] = useState("");
  const [error, setError] = useState("");
  const toast = useToast();

  const sorted = [...me.scores].sort((a, b) => b.date.localeCompare(a.date));

  async function save() {
    setError("");
    if (me.status !== "active") { setError("Renew your subscription to log scores."); return; }
    const v = Number(score);
    if (!date || !v || v < 1 || v > 45) { setError("Enter a date and a score between 1 and 45."); return; }
    try {
      await userApi.upsertScore({ date, score: v });
      setDate(""); setScore("");
      toast("Score saved ⛳");
      reload();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(d) {
    await userApi.deleteScore(d);
    toast("Score removed.");
    reload();
  }

  return (
    <div className="card reveal">
      <h3>⛳ Your last five rounds</h3>
      <p>Only your most recent five scores count. Add a new date and the oldest one rolls off automatically.</p>
      <div className="field" style={{ maxWidth: 420, display: "flex", gap: 10, alignItems: "end", flexDirection: "row" }}>
        <div style={{ flex: 1 }}><label className="help">Date</label><input type="date" max={todayStr()} value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div style={{ flex: 1 }}><label className="help">Stableford score (1–45)</label><input type="number" min="1" max="45" value={score} onChange={(e) => setScore(e.target.value)} /></div>
        <button className="btn btn-gold" onClick={save}>Save</button>
      </div>
      {error && <div className="error-msg">{error}</div>}
      <table style={{ marginTop: 10 }}>
        <thead><tr><th>Date</th><th>Score</th><th></th></tr></thead>
        <tbody>
          {sorted.map((s) => (
            <tr key={s.date}>
              <td>{fmtDate(s.date)}</td>
              <td className="mono">{s.score}</td>
              <td>
                <button className="btn btn-ghost btn-sm" onClick={() => { setDate(s.date); setScore(s.score); }}>Edit</button>{" "}
                <button className="btn btn-ghost btn-sm" onClick={() => remove(s.date)}>Delete</button>
              </td>
            </tr>
          ))}
          {!sorted.length && <tr><td colSpan={3}>No scores yet — add your first round above.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
