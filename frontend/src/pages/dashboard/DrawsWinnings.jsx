import { useEffect, useState } from "react";
import { drawApi } from "../../api/draws";
import { useToast } from "../../context/ToastContext";
import { fmtMoney } from "../../utils/format";

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function DrawsWinnings({ me }) {
  const [draws, setDraws] = useState([]);
  const toast = useToast();

  function load() {
    drawApi.listMine().then(setDraws).catch(() => {});
  }
  useEffect(load, []);

  const userNums = new Set(me.scores.map((s) => s.score));

  async function handleUpload(drawId, file) {
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    await drawApi.uploadProof(drawId, dataUrl);
    toast("Proof uploaded — awaiting review 📤");
    load();
  }

  return (
    <div className="reveal">
      <div className="card"><h3>🎟️ Your draw history</h3></div>
      {!draws.length && <div className="empty" style={{ marginTop: 14 }}>No draws published yet.</div>}
      {draws.map((d) => (
        <div className="card" style={{ marginTop: 14 }} key={d._id}>
          <div className="section-head" style={{ marginBottom: 10 }}>
            <h4 style={{ margin: 0 }}>{d.label}</h4>
            {d.win ? <span className="badge ok">🏆 {d.win.tier}-match · {fmtMoney(d.win.amount)}</span> : <span className="badge warn">No match</span>}
          </div>
          <div className="balls">
            {d.numbers.map((n) => <div key={n} className={`ball ${userNums.has(n) ? "match" : ""}`}>{n}</div>)}
          </div>
          {d.win && (
            <div style={{ marginTop: 12 }}>
              {d.win.payStatus === "paid" && <span className="badge ok">✅ Paid</span>}
              {d.win.payStatus !== "paid" && d.win.proofUrl && <span className="badge warn">⏳ Proof submitted — awaiting admin review</span>}
              {d.win.payStatus !== "paid" && !d.win.proofUrl && (
                <>
                  <p className="help" style={{ marginBottom: 6 }}>Upload a screenshot of this round's scores to claim your prize.</p>
                  <input type="file" accept="image/*" onChange={(e) => handleUpload(d._id, e.target.files[0])} />
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
