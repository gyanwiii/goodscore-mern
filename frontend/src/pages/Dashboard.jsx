import { useEffect, useState, useCallback } from "react";
import { authApi } from "../api/auth";
import { useNavigate } from "react-router-dom";

import Overview from "./dashboard/Overview";
import Scores from "./dashboard/Scores";
import CharityPanel from "./dashboard/CharityPanel";
import DrawsWinnings from "./dashboard/DrawsWinnings";
import Settings from "./dashboard/Settings";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "scores", label: "My scores" },
  { id: "charity", label: "My charity" },
  { id: "draws", label: "Draws & winnings" },
  { id: "settings", label: "Settings" },
];

export default function Dashboard() {
  const [tab, setTab] = useState("overview");
  const [me, setMe] = useState(null);
  const navigate = useNavigate();

  const reload = useCallback(() => {
    authApi.me().then(({ user }) => setMe(user)).catch(() => {});
  }, []);

  useEffect(() => { reload(); }, [reload]);

  if (!me) return <div className="container" style={{ padding: "60px 0" }}>Loading your dashboard…</div>;

  const panelProps = { me, reload };

  return (
    <section className="container" style={{ paddingTop: 36 }}>
      <div className="dash">
        <div className="dash-side card">
          {TABS.map((t) => (
            <button key={t.id} className={tab === t.id ? "active" : ""} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </div>
        <div>
          {me.status !== "active" && (
            <div className="card" style={{ border: "1px solid var(--coral)", marginBottom: 20 }}>
              <strong>⚠️ Your subscription is {me.status}.</strong>
              <p style={{ margin: "6px 0 12px" }}>Score entry, draws and winnings are limited until you renew.</p>
              <button className="btn btn-primary btn-sm" onClick={() => navigate("/subscribe")}>Renew subscription</button>
            </div>
          )}
          {tab === "overview" && <Overview {...panelProps} />}
          {tab === "scores" && <Scores {...panelProps} />}
          {tab === "charity" && <CharityPanel {...panelProps} />}
          {tab === "draws" && <DrawsWinnings {...panelProps} />}
          {tab === "settings" && <Settings {...panelProps} />}
        </div>
      </div>
    </section>
  );
}
