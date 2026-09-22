import { useEffect, useState } from "react";
import { drawApi } from "../../api/draws";
import { useToast } from "../../context/ToastContext";
import { fmtMoney } from "../../utils/format";

export default function Winners() {
  const [draws, setDraws] = useState([]);
  const toast = useToast();

  function load() { drawApi.listAll().then((all) => setDraws(all.filter((d) => d.status === "published"))); }
  useEffect(load, []);

  async function setStatus(drawId, winnerId, status) {
    try {
      await drawApi.setWinnerStatus(drawId, winnerId, status);
      toast(status === "paid" ? "Marked as paid ✅" : "Rejected — player can resubmit.");
      load();
    } catch (err) {
      toast(err.message);
    }
  }

  const rows = draws.flatMap((d) => d.winners.map((w) => ({ draw: d, w })));

  return (
    <div className="card reveal">
      <h3>🏆 Winner verification</h3>
      <table>
        <thead><tr><th>Draw</th><th>Winner</th><th>Tier</th><th>Amount</th><th>Proof</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {!rows.length && <tr><td colSpan={7}>No winners recorded yet.</td></tr>}
          {rows.map(({ draw, w }) => (
            <tr key={w._id}>
              <td>{draw.label}</td>
              <td>{w.user?.name || "—"}</td>
              <td>{w.tier}-match</td>
              <td className="mono">{fmtMoney(w.amount)}</td>
              <td>{w.proofUrl ? <a href={w.proofUrl} target="_blank" rel="noreferrer">view 🖼️</a> : "—"}</td>
              <td><span className={`badge ${w.payStatus === "paid" ? "ok" : w.payStatus === "rejected" ? "bad" : "warn"}`}>{w.payStatus}</span></td>
              <td>
                {w.payStatus !== "paid" && (
                  <button className="btn btn-primary btn-sm" disabled={!w.proofUrl} onClick={() => setStatus(draw._id, w._id, "paid")}>Mark paid</button>
                )}{" "}
                {w.payStatus !== "paid" && w.payStatus !== "rejected" && (
                  <button className="btn btn-ghost btn-sm" onClick={() => setStatus(draw._id, w._id, "rejected")}>Reject proof</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
