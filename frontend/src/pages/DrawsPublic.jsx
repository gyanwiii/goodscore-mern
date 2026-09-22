import { useEffect, useState } from "react";
import { drawApi } from "../api/draws";
import DrawBalls from "../components/DrawBalls";
import { fmtMoney } from "../utils/format";

export default function DrawsPublic() {
  const [draws, setDraws] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    drawApi.listPublished().then((d) => { setDraws(d); setLoaded(true); }).catch(() => setLoaded(true));
  }, []);

  return (
    <section className="container">
      <div className="section-head"><h2>Draw history</h2></div>
      {loaded && !draws.length && <div className="empty">No draws have been published yet. Check back after the first of the month! 🎟️</div>}
      {draws.map((d) => {
        const tiersHit = new Set(d.winners.map((w) => w.tier)).size;
        return (
          <div className="card" style={{ marginBottom: 16 }} key={d._id}>
            <div className="section-head" style={{ marginBottom: 12 }}>
              <h3 style={{ margin: 0 }}>{d.label} <span className="tag">{d.type === "algorithmic" ? "⚙️ algorithmic" : "🎲 random"}</span></h3>
              <span className="mono">{fmtMoney(d.poolTotal)} pool</span>
            </div>
            <DrawBalls numbers={d.numbers} />
            <p style={{ marginTop: 14 }}>
              {d.winners.length} winner{d.winners.length === 1 ? "" : "s"} across {tiersHit} tier(s).
              {d.jackpotCarryOut > 0 && ` No 5-match winner — ${fmtMoney(d.jackpotCarryOut)} rolls into next month's jackpot. 🎊`}
            </p>
          </div>
        );
      })}
    </section>
  );
}
