import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { userApi, subscriptionApi } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { fmtDate } from "../../utils/format";

export default function Settings({ me, reload }) {
  const [name, setName] = useState(me.name);
  const [email, setEmail] = useState(me.email);
  const { refreshUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  async function save() {
    await userApi.updateProfile({ name, email });
    await refreshUser();
    toast("Profile updated.");
    reload();
  }

  async function cancelSub() {
    await subscriptionApi.cancel();
    toast("Subscription cancelled.");
    reload();
  }

  return (
    <div className="card reveal">
      <h3>⚙️ Account</h3>
      <div className="field"><label>Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} /></div>
      <div className="field"><label>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <button className="btn btn-primary btn-sm" onClick={save}>Save</button>

      <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
        <h3>Plan</h3>
        <p>{me.plan ? `${me.plan} plan — status ${me.status}${me.renewalDate ? `, renews ${fmtDate(me.renewalDate)}` : ""}` : "No active plan."}</p>
        {me.status === "active"
          ? <button className="btn btn-ghost btn-sm" onClick={cancelSub}>Cancel subscription</button>
          : <button className="btn btn-primary btn-sm" onClick={() => navigate("/subscribe")}>Subscribe</button>}
      </div>
    </div>
  );
}
