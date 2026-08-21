import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside aria-label="Authenticated navigation">
      <strong>MoveMate</strong>
      <nav>
        <NavLink to="/dashboard">Dashboard</NavLink>
      </nav>
      <button type="button" onClick={handleLogout}>
        Log out
      </button>
    </aside>
  );
}

export default Sidebar;
