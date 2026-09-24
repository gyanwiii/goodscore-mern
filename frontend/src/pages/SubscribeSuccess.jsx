import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { subscriptionApi } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function SubscribeSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [status, setStatus] = useState("checking"); // checking | done | error
  const [error, setError] = useState("");
  const { setUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  async function attemptConfirm() {
    if (!sessionId) {
      setStatus("error");
      setError("No checkout session was found in the URL.");
      return;
    }
    setStatus("checking");
    try {
      const { user } = await subscriptionApi.confirm(sessionId);
      setUser(user);
      toast("Subscribed! Welcome to GoodScore 🎉");
      setStatus("done");
      setTimeout(() => navigate("/dashboard"), 900);
    } catch (err) {
      setStatus("error");
      setError(err.message);
    }
  }

  useEffect(() => { attemptConfirm(); }, [sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="container" style={{ paddingTop: 80, textAlign: "center" }}>
      <div className="card form-card reveal" style={{ margin: "0 auto" }}>
        {status === "checking" && (
          <>
            <h2>Confirming your payment…</h2>
            <p>Hang tight — we're checking with Stripe that everything went through.</p>
          </>
        )}
        {status === "done" && (
          <>
            <h2>You're in! 🎉</h2>
            <p>Taking you to your dashboard…</p>
          </>
        )}
        {status === "error" && (
          <>
            <h2>Hmm, couldn't confirm that yet</h2>
            <p className="error-msg">{error}</p>
            <p>If you completed payment on Stripe's page, this is usually just a timing hiccup — try again.</p>
            <button className="btn btn-primary" style={{ width: "100%", marginBottom: 10 }} onClick={attemptConfirm}>Check again</button>
            <Link to="/subscribe">Back to plans</Link>
          </>
        )}
      </div>
    </section>
  );
}
