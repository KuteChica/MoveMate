import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="sticky top-0 z-20 border-b border-[#dcebea] bg-white/95 shadow-[0_4px_18px_rgba(23,60,65,0.06)] backdrop-blur" aria-label="Authenticated navigation">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-3 px-4 py-3 sm:px-6 lg:px-8">
        <NavLink className="mr-auto flex items-center gap-2 text-base font-black tracking-[-0.04em] text-[#007d7b]" to="/dashboard">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#007d7b] text-sm font-black text-white">M</span>
          MoveMate
        </NavLink>
        <nav className="order-3 flex w-full flex-wrap items-center gap-1 border-t border-slate-100 pt-2 sm:order-none sm:w-auto sm:border-0 sm:pt-0" aria-label="Main navigation">
        <NavLink className={({ isActive }) => `rounded-md px-3 py-2 text-sm font-semibold transition ${isActive ? "bg-teal-50 text-[#007d7b]" : "text-slate-600 hover:bg-slate-50 hover:text-[#007d7b]"}`} to="/">Home</NavLink>
        <NavLink className={({ isActive }) => `rounded-md px-3 py-2 text-sm font-semibold transition ${isActive ? "bg-teal-50 text-[#007d7b]" : "text-slate-600 hover:bg-slate-50 hover:text-[#007d7b]"}`} to="/dashboard">Dashboard</NavLink>
        {user?.role === "representative" || user?.role === "admin" ? (
          <NavLink className={({ isActive }) => `rounded-md px-3 py-2 text-sm font-semibold transition ${isActive ? "bg-teal-50 text-[#007d7b]" : "text-slate-600 hover:bg-slate-50 hover:text-[#007d7b]"}`} to="/representative">Operations</NavLink>
        ) : user?.role === "driver" ? (
          <NavLink className={({ isActive }) => `rounded-md px-3 py-2 text-sm font-semibold transition ${isActive ? "bg-teal-50 text-[#007d7b]" : "text-slate-600 hover:bg-slate-50 hover:text-[#007d7b]"}`} to="/driver-dashboard">Driver Dashboard</NavLink>
        ) : (
          <>
            <NavLink className={({ isActive }) => `rounded-md px-3 py-2 text-sm font-semibold transition ${isActive ? "bg-teal-50 text-[#007d7b]" : "text-slate-600 hover:bg-slate-50 hover:text-[#007d7b]"}`} to="/track-shuttle">Track Shuttle</NavLink>
            <NavLink className={({ isActive }) => `rounded-md px-3 py-2 text-sm font-semibold transition ${isActive ? "bg-teal-50 text-[#007d7b]" : "text-slate-600 hover:bg-slate-50 hover:text-[#007d7b]"}`} to="/notifications">Notifications</NavLink>
          </>
        )}
        <NavLink className={({ isActive }) => `rounded-md px-3 py-2 text-sm font-semibold transition ${isActive ? "bg-teal-50 text-[#007d7b]" : "text-slate-600 hover:bg-slate-50 hover:text-[#007d7b]"}`} to="/bus-status">Bus Status</NavLink>
        <NavLink className={({ isActive }) => `rounded-md px-3 py-2 text-sm font-semibold transition ${isActive ? "bg-teal-50 text-[#007d7b]" : "text-slate-600 hover:bg-slate-50 hover:text-[#007d7b]"}`} to="/routes">Routes</NavLink>
        <NavLink className={({ isActive }) => `rounded-md px-3 py-2 text-sm font-semibold transition ${isActive ? "bg-teal-50 text-[#007d7b]" : "text-slate-600 hover:bg-slate-50 hover:text-[#007d7b]"}`} to="/profile">Profile</NavLink>
        </nav>
      <button className="rounded-md border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50" type="button" onClick={handleLogout}>
        Sign Out
      </button>
      </div>
    </aside>
  );
}

export default Sidebar;
