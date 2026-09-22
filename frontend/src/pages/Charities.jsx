import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { charityApi } from "../api/charities";
import { CharityCard, CharityModal } from "../components/Charity";

export default function Charities() {
  const [charities, setCharities] = useState([]);
  const [query, setQuery] = useState("");
  const [cause, setCause] = useState("");
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    charityApi.list().then(setCharities).catch(() => {});
  }, []);

  const causes = useMemo(() => Array.from(new Set(charities.map((c) => c.cause))), [charities]);
  const filtered = charities.filter(
    (c) =>
      (!cause || c.cause === cause) &&
      (!query || c.name.toLowerCase().includes(query.toLowerCase()) || c.blurb.toLowerCase().includes(query.toLowerCase()))
  );

  const openId = params.get("open");
  const openCharity = charities.find((c) => c._id === openId);

  function pickCharity(c) {
    navigate("/subscribe", { state: { charityId: c._id } });
  }

  return (
    <section className="container">
      <div className="section-head">
        <h2>Charities on GoodScore</h2>
        <p style={{ margin: 0 }}>Pick one at signup, change any time, and give more than the 10% minimum whenever you like.</p>
      </div>
      <div className="search-row">
        <input type="text" placeholder="Search charities…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select value={cause} onChange={(e) => setCause(e.target.value)}>
          <option value="">All causes</option>
          {causes.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="grid-3">
        {filtered.map((c) => (
          <CharityCard key={c._id} charity={c} />
        ))}
        {!filtered.length && <div className="empty">No charities match that search. 🔍</div>}
      </div>

      <CharityModal charity={openCharity} onClose={() => setParams({})} onPick={pickCharity} />
    </section>
  );
}
