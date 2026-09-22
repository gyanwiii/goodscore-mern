import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { applySession } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { token, user } = await authApi.login({ email, password });
      applySession({ token, user });
      toast(`Welcome back, ${user.name.split(" ")[0]}! 👋`);
      navigate(user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="container" style={{ paddingTop: 64 }}>
      <form className="card form-card reveal" onSubmit={submit}>
        <h2>Welcome back</h2>
        {error && <div className="error-msg">{error}</div>}
        <div className="field"><label>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></div>
        <div className="field"><label>Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" /></div>
        <button className="btn btn-primary" style={{ width: "100%" }} disabled={busy}>{busy ? "Logging in…" : "Log in"}</button>
        <p style={{ marginTop: 16, textAlign: "center" }}>No account yet? <Link to="/subscribe">Subscribe to get started</Link></p>
        <p className="help" style={{ textAlign: "center" }}>Demo admin: admin@goodscore.app / admin123 · Demo player: alex@example.com / player123</p>
      </form>
    </section>
  );
}
