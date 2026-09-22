import { useState } from "react";
import Users from "./admin/Users";
import Draws from "./admin/Draws";
import Charities from "./admin/Charities";
import Winners from "./admin/Winners";
import Reports from "./admin/Reports";

const TABS = [
  { id: "users", label: "Users" },
  { id: "draws", label: "Draws" },
  { id: "charities", label: "Charities" },
  { id: "winners", label: "Winners" },
  { id: "reports", label: "Reports" },
];

export default function Admin() {
  const [tab, setTab] = useState("users");

  return (
    <section className="container" style={{ paddingTop: 36 }}>
      <div className="section-head"><h2>Admin control room 🛠️</h2></div>
      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? "active" : ""} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>
      {tab === "users" && <Users />}
      {tab === "draws" && <Draws />}
      {tab === "charities" && <Charities />}
      {tab === "winners" && <Winners />}
      {tab === "reports" && <Reports />}
    </section>
  );
}
