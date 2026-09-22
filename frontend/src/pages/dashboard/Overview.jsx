import { useEffect, useState } from "react";
import { drawApi } from "../../api/draws";
import { fmtMoney, fmtDate } from "../../utils/format";

export default function Overview({ me }) {
  const [myDraws, setMyDraws] = useState([]);

  useEffect(() => {
    drawApi.listMine().then(setMyDraws).catch(() => {});
  }, []);

  const totalWon = myDraws.reduce((s, d) => s + (d.win?.amount || 0), 0);

  return (
    <div className="reveal">
      <div className="stat-row">
        <div className="stat"><div className="num">{me.status === "active" ? "✅" : "⏸️"}</div><div className="lbl">Subscription — {me.status}{me.renewalDate ? ` · renews ${fmtDate(me.renewalDate)}` : ""}</div></div>
        <div className="stat"><div className="num">{me.scores.length}/5</div><div className="lbl">Scores on file</div></div>
        <div className="stat"><div className="num">{myDraws.length}</div><div className="lbl">Draws entered</div></div>
        <div className="stat"><div className="num">{fmtMoney(totalWon)}</div><div className="lbl">Total won</div></div>
      </div>
      <div className="grid-2">
        <div className="card">
          <h3>🎗️ Supporting</h3>
          {me.charity ? (
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div className="charity-emoji">{me.charity.emoji}</div>
              <div><strong>{me.charity.name}</strong><div className="help">{me.charityPercent}% of your subscription</div></div>
            </div>
          ) : <p>No charity selected yet.</p>}
        </div>
        <div className="card">
          <h3>🎟️ Draws</h3>
          <p>{myDraws.length ? `You've been entered in ${myDraws.length} published draw(s).` : "No draws published yet this cycle."}</p>
        </div>
      </div>
    </div>
  );
}
