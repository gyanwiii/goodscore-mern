import { useNavigate } from "react-router-dom";

export function CharityCard({ charity, big, onPick }) {
  const navigate = useNavigate();
  return (
    <div className="card charity-card">
      <div className="charity-emoji" style={big ? { width: 64, height: 64, fontSize: "2rem" } : undefined}>
        {charity.emoji}
      </div>
      <h3>{charity.name}</h3>
      <span className="tag">{charity.cause}</span>
      <p>{charity.blurb}</p>
      <button className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-start" }} onClick={() => navigate(`/charities?open=${charity._id}`)}>
        View profile
      </button>
    </div>
  );
}

export function CharityModal({ charity, onClose, onPick }) {
  if (!charity) return null;
  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        <div className="charity-emoji" style={{ width: 64, height: 64, fontSize: "2rem", marginBottom: 10 }}>
          {charity.emoji}
        </div>
        <h2>{charity.name}</h2>
        <span className="tag">{charity.cause}</span>
        <p style={{ marginTop: 14 }}>{charity.description}</p>
        <h3 style={{ fontSize: "1rem", marginTop: 18 }}>Upcoming events</h3>
        {charity.events?.length ? (
          charity.events.map((e, i) => (
            <div className="card" key={i} style={{ marginBottom: 8, background: "var(--panel-2)" }}>
              🗓️ <strong>{e.name}</strong> — {new Date(e.date + "T00:00:00").toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
            </div>
          ))
        ) : (
          <p>No events scheduled right now.</p>
        )}
        {onPick && (
          <button className="btn btn-primary" style={{ width: "100%", marginTop: 10 }} onClick={() => onPick(charity)}>
            Choose this charity at signup
          </button>
        )}
      </div>
    </div>
  );
}
