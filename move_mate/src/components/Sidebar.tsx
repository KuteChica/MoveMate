import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <aside aria-label="Authenticated navigation">
      <strong>MoveMate</strong>
      <nav>
        <NavLink to="/dashboard">Dashboard</NavLink>
        {user?.role === "representative" ? (
          <NavLink to="/representative">Operations</NavLink>
        ) : (
          <>
            <NavLink to="/track-shuttle">Track Shuttle</NavLink>
            <NavLink to="/notifications">Notifications</NavLink>
          </>
        )}
        <NavLink to="/routes">Routes</NavLink>
        <NavLink to="/profile">Profile</NavLink>
      </nav>
      <button type="button" onClick={handleLogout}>
        Log out
      </button>
    </aside>
  );
}

export default Sidebar;
