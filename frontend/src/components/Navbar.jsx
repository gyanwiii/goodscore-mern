import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  const linkClass = ({ isActive }) => (isActive ? "active" : "");

  return (
    <nav className="nav">
      <div className="nav-inner">
        <NavLink to="/" className="brand" style={{ textDecoration: "none" }}>
          <span className="mark">🎯</span>GoodScore
        </NavLink>
        <div className="navlinks">
          <NavLink to="/" end className={linkClass}>Home</NavLink>
          <NavLink to="/charities" className={linkClass}>Charities</NavLink>
          <NavLink to="/draws" className={linkClass}>Draws</NavLink>
          {user?.role === "user" && <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>}
          {user?.role === "admin" && <NavLink to="/admin" className={linkClass}>Admin</NavLink>}
        </div>
        <div className="nav-cta">
          {user ? (
            <>
              <span className="tag">👋 {user.name.split(" ")[0]}</span>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="btn btn-ghost btn-sm" style={{ textDecoration: "none" }}>Log in</NavLink>
              <NavLink to="/subscribe" className="btn btn-primary btn-sm" style={{ textDecoration: "none" }}>Subscribe</NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
