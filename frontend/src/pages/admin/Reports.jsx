import { useEffect, useState } from "react";
import { adminApi } from "../../api/admin";
import { fmtMoney } from "../../utils/format";

export default function Reports() {
  const [data, setData] = useState(null);

  useEffect(() => { adminApi.reports().then(setData); }, []);

  if (!data) return <div className="card reveal">Loading reports…</div>;

  const maxTotal = Math.max(1, ...data.charityTotals.map((x) => x.total));

  return (
    <div className="reveal">
      <div className="stat-row">
        <div className="stat"><div className="num">{data.totalUsers}</div><div className="lbl">Total users</div></div>
        <div className="stat"><div className="num">{data.activeSubscribers}</div><div className="lbl">Active subscribers</div></div>
        <div className="stat"><div className="num mono">{fmtMoney(data.currentPool)}</div><div className="lbl">Current prize pool</div></div>
        <div className="stat"><div className="num">{data.drawsRun}</div><div className="lbl">Draws published</div></div>
      </div>
      <div className="card">
        <h3>🎗️ Monthly charity contribution totals</h3>
        {data.charityTotals.map(({ charity, total }) => (
          <div style={{ marginBottom: 12 }} key={charity._id}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".88rem", marginBottom: 4 }}>
              <span>{charity.emoji} {charity.name}</span><span className="mono">{fmtMoney(total)}/mo</span>
            </div>
            <div className="progress-bar"><span style={{ width: `${(total / maxTotal * 100).toFixed(0)}%` }}></span></div>
          </div>
        ))}
      </div>
    </div>
  );
}
