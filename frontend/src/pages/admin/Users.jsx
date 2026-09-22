import { useEffect, useState } from "react";
import { adminApi } from "../../api/admin";
import { fmtDate, todayStr } from "../../utils/format";

function ScoreModal({ user, onClose, onChanged }) {
  const [date, setDate] = useState("");
  const [score, setScore] = useState("");
  const sorted = [...user.scores].sort((a, b) => b.date.localeCompare(a.date));

  async function save() {
    if (!date || !score) return;
    await adminApi.upsertUserScore(user._id, { date, score: Number(score) });
    setDate(""); setScore("");
    onChanged();
  }
  async function remove(d) {
    await adminApi.deleteUserScore(user._id, d);
    onChanged();
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <h3>Edit scores — {user.name}</h3>
        <div className="field" style={{ display: "flex", gap: 10, flexDirection: "row", alignItems: "end" }}>
          <div style={{ flex: 1 }}><label className="help">Date</label><input type="date" max={todayStr()} value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div style={{ flex: 1 }}><label className="help">Score</label><input type="number" min="1" max="45" value={score} onChange={(e) => setScore(e.target.value)} /></div>
          <button className="btn btn-gold" onClick={save}>Save</button>
        </div>
        <table>
          <thead><tr><th>Date</th><th>Score</th><th></th></tr></thead>
          <tbody>
            {sorted.map((s) => (
              <tr key={s.date}><td>{fmtDate(s.date)}</td><td className="mono">{s.score}</td>
                <td><button className="btn btn-ghost btn-sm" onClick={() => remove(s.date)}>Delete</button></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);

  function load() { adminApi.listUsers().then((list) => {
    setUsers(list);
    setEditing((cur) => cur ? list.find((u) => u._id === cur._id) || null : cur);
  }); }
  useEffect(load, []);

  async function toggle(u) {
    await adminApi.setUserStatus(u._id, u.status === "active" ? "inactive" : "active");
    load();
  }

  return (
    <div className="card reveal">
      <h3>👥 Users</h3>
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Plan</th><th>Status</th><th>Charity</th><th>Scores</th><th></th></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td><td>{u.email}</td><td>{u.plan || "—"}</td>
              <td><span className={`badge ${u.status === "active" ? "ok" : u.status === "lapsed" ? "warn" : "bad"}`}>{u.status}</span></td>
              <td>{u.charity ? `${u.charity.emoji} ${u.charity.name}` : "—"}</td>
              <td className="mono">{u.scores.length}/5</td>
              <td>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(u)}>Edit scores</button>{" "}
                <button className="btn btn-ghost btn-sm" onClick={() => toggle(u)}>{u.status === "active" ? "Deactivate" : "Activate"}</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editing && <ScoreModal user={editing} onClose={() => setEditing(null)} onChanged={() => { load(); }} />}
    </div>
  );
}
