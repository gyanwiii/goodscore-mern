import { useEffect, useState } from "react";
import { charityApi } from "../../api/charities";
import { subscriptionApi } from "../../api/auth";
import { useToast } from "../../context/ToastContext";

export default function CharityPanel({ me, reload }) {
  const [charities, setCharities] = useState([]);
  const [charityId, setCharityId] = useState(me.charity?._id || me.charity || "");
  const [pct, setPct] = useState(me.charityPercent || 10);
  const toast = useToast();

  useEffect(() => { charityApi.list().then(setCharities); }, []);

  const selected = charities.find((c) => c._id === charityId);

  async function save() {
    await subscriptionApi.updateCharity({ charity: charityId, charityPercent: pct });
    toast("Charity preferences updated 🎗️");
    reload();
  }

  return (
    <div className="card reveal">
      <h3>🎗️ Your charity</h3>
      <div className="field">
        <label>Charity</label>
        <select value={charityId} onChange={(e) => setCharityId(e.target.value)}>
          {charities.map((c) => <option key={c._id} value={c._id}>{c.emoji} {c.name}</option>)}
        </select>
      </div>
      <div className="field">
        <label>Contribution: <strong>{pct}%</strong></label>
        <input type="range" min="10" max="100" step="5" value={pct} onChange={(e) => setPct(Number(e.target.value))} />
      </div>
      <button className="btn btn-primary btn-sm" onClick={save}>Save changes</button>
      {selected && <div style={{ marginTop: 16 }}><p>{selected.description}</p></div>}
    </div>
  );
}
