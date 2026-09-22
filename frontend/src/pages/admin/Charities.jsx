import { useEffect, useState } from "react";
import { charityApi } from "../../api/charities";
import { useToast } from "../../context/ToastContext";

export default function Charities() {
  const [charities, setCharities] = useState([]);
  const [form, setForm] = useState({ name: "", emoji: "🎗️", cause: "", blurb: "", description: "" });
  const toast = useToast();

  function load() { charityApi.list().then(setCharities); }
  useEffect(load, []);

  async function add() {
    if (!form.name.trim()) return toast("Give the charity a name first.");
    await charityApi.create(form);
    setForm({ name: "", emoji: "🎗️", cause: "", blurb: "", description: "" });
    toast("Charity added 🎗️");
    load();
  }

  async function remove(id) {
    try { await charityApi.remove(id); load(); }
    catch (err) { toast(err.message); }
  }

  return (
    <div className="reveal">
      <div className="card" style={{ marginBottom: 18 }}>
        <h3>➕ Add a charity</h3>
        <div className="grid-2">
          <div className="field"><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="field"><label>Emoji</label><input value={form.emoji} maxLength={4} onChange={(e) => setForm({ ...form, emoji: e.target.value })} /></div>
          <div className="field"><label>Cause</label><input placeholder="Education" value={form.cause} onChange={(e) => setForm({ ...form, cause: e.target.value })} /></div>
          <div className="field"><label>Short blurb</label><input value={form.blurb} onChange={(e) => setForm({ ...form, blurb: e.target.value })} /></div>
        </div>
        <div className="field"><label>Full description</label><textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <button className="btn btn-primary btn-sm" onClick={add}>Add charity</button>
      </div>

      <div className="card">
        <h3>Manage charities</h3>
        <table>
          <thead><tr><th></th><th>Name</th><th>Cause</th><th></th></tr></thead>
          <tbody>
            {charities.map((c) => (
              <tr key={c._id}>
                <td style={{ fontSize: "1.3rem" }}>{c.emoji}</td><td>{c.name}</td><td>{c.cause}</td>
                <td><button className="btn btn-danger btn-sm" onClick={() => remove(c._id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
