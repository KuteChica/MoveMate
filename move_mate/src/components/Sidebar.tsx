import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const closeMenu = () => setIsOpen(false);

  const handleLogout = async () => {
    closeMenu();
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="sticky top-0 z-50 border-b border-[#dcebea] bg-white/95 shadow-[0_4px_18px_rgba(23,60,65,0.06)] backdrop-blur" aria-label="Authenticated navigation">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center px-4 py-3 sm:gap-x-8 sm:gap-y-3 sm:px-6 lg:px-8">
        <NavLink onClick={closeMenu} className="mr-auto flex items-center gap-2 text-base font-black tracking-[-0.04em] text-[#007d7b]" to="/dashboard">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#007d7b] text-sm font-black text-white">M</span>
          MoveMate
        </NavLink>
        <button className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-xl text-slate-700 sm:hidden" type="button" aria-label="Toggle navigation" aria-expanded={isOpen} onClick={() => setIsOpen((open) => !open)}>{isOpen ? "×" : "☰"}</button>
        <nav className={`${isOpen ? "flex" : "hidden"} order-3 w-full flex-col gap-1 border-t border-slate-100 pt-3 sm:order-none sm:flex sm:w-auto sm:flex-row sm:items-center sm:border-0 sm:pt-0`} aria-label="Main navigation">
        <NavLink onClick={closeMenu} className={({ isActive }) => `rounded-md px-3 py-2.5 text-sm font-semibold transition ${isActive ? "bg-teal-50 text-[#007d7b]" : "text-slate-600 hover:bg-slate-50 hover:text-[#007d7b]"}`} to="/">Home</NavLink>
        <NavLink onClick={closeMenu} className={({ isActive }) => `rounded-md px-3 py-2.5 text-sm font-semibold transition ${isActive ? "bg-teal-50 text-[#007d7b]" : "text-slate-600 hover:bg-slate-50 hover:text-[#007d7b]"}`} to="/dashboard">Dashboard</NavLink>
        {user?.role === "representative" || user?.role === "admin" ? (
          <NavLink onClick={closeMenu} className={({ isActive }) => `rounded-md px-3 py-2.5 text-sm font-semibold transition ${isActive ? "bg-teal-50 text-[#007d7b]" : "text-slate-600 hover:bg-slate-50 hover:text-[#007d7b]"}`} to="/representative">Operations</NavLink>
        ) : user?.role === "driver" ? (
          <NavLink onClick={closeMenu} className={({ isActive }) => `rounded-md px-3 py-2.5 text-sm font-semibold transition ${isActive ? "bg-teal-50 text-[#007d7b]" : "text-slate-600 hover:bg-slate-50 hover:text-[#007d7b]"}`} to="/driver-dashboard">Driver Dashboard</NavLink>
        ) : (
          <>
            <NavLink onClick={closeMenu} className={({ isActive }) => `rounded-md px-3 py-2.5 text-sm font-semibold transition ${isActive ? "bg-teal-50 text-[#007d7b]" : "text-slate-600 hover:bg-slate-50 hover:text-[#007d7b]"}`} to="/track-shuttle">Track Shuttle</NavLink>
            <NavLink onClick={closeMenu} className={({ isActive }) => `rounded-md px-3 py-2.5 text-sm font-semibold transition ${isActive ? "bg-teal-50 text-[#007d7b]" : "text-slate-600 hover:bg-slate-50 hover:text-[#007d7b]"}`} to="/notifications">Notifications</NavLink>
          </>
        )}
        <NavLink onClick={closeMenu} className={({ isActive }) => `rounded-md px-3 py-2.5 text-sm font-semibold transition ${isActive ? "bg-teal-50 text-[#007d7b]" : "text-slate-600 hover:bg-slate-50 hover:text-[#007d7b]"}`} to="/bus-status">Bus Status</NavLink>
        <NavLink onClick={closeMenu} className={({ isActive }) => `rounded-md px-3 py-2.5 text-sm font-semibold transition ${isActive ? "bg-teal-50 text-[#007d7b]" : "text-slate-600 hover:bg-slate-50 hover:text-[#007d7b]"}`} to="/profile">Profile</NavLink>
        </nav>
      <button className="hidden rounded-md border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 sm:block" type="button" onClick={handleLogout}>
        Sign Out
      </button>
      {isOpen && <button className="order-4 w-full rounded-md border border-rose-200 px-3 py-2 text-left text-sm font-semibold text-rose-700 transition hover:bg-rose-50 sm:hidden" type="button" onClick={handleLogout}>Sign Out</button>}
      </div>
    </aside>
  );
}

export default Sidebar;
