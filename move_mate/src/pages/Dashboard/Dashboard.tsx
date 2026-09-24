import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getShuttles, type ApiShuttle } from "../../services/transitApi";

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function Dashboard() {
  const { user } = useAuth();
  const [shuttles, setShuttles] = useState<ApiShuttle[]>([]);
  const [selectedShuttleId, setSelectedShuttleId] = useState<string>("");
  const [greeting, setGreeting] = useState<string>(getGreeting());

  if (user?.role === "driver") return <Navigate to="/driver-dashboard" replace />;
  if (user?.role === "admin" || user?.role === "representative") return <Navigate to="/representative" replace />;

  useEffect(() => {
    getShuttles().then((items) => {
      setShuttles(items);
      setSelectedShuttleId((current) => current || String(items[0]?.id || ""));
    }).catch(() => {
      setShuttles([]);
      setSelectedShuttleId("");
    });
  }, []);

  const shuttle = shuttles.find((item) => String(item.id) === selectedShuttleId) || shuttles[0] || null;
  const serviceState = shuttle?.status ?? "inactive";
  const locationText = shuttle?.place_name || (shuttle && shuttle.latitude !== null && shuttle.longitude !== null ? `GPS ${shuttle.latitude.toFixed(5)}, ${shuttle.longitude.toFixed(5)}` : "Location unavailable");
  const serviceStatusText = serviceState === "active" ? "On schedule" : serviceState === "maintenance" ? "Under maintenance" : "Inactive";
  const serviceStatusColor = serviceState === "active" ? "text-emerald-700" : serviceState === "maintenance" ? "text-amber-700" : "text-slate-700";

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-10">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-700">Student dashboard</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">{greeting}, {user?.name ?? "Student rider"}</h1>
      <p className="mt-3 text-slate-600">Your next ride is ready when you are.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-teal-100 bg-teal-50 p-5 md:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-teal-800">Nearest shuttle</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">{shuttle?.name ?? "No shuttle available"}</h2>
            </div>
            {shuttles.length > 0 && (
              <label className="w-full max-w-[220px] text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Select shuttle
                <select className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900" value={selectedShuttleId} onChange={(event) => setSelectedShuttleId(event.target.value)}>
                  {shuttles.map((item) => <option key={item.id} value={String(item.id)}>{item.name}</option>)}
                </select>
              </label>
            )}
          </div>
          <p className="mt-4 text-slate-600">Current location: {locationText}</p>
          <p className="mt-5 text-sm text-slate-600">Route <span className="font-semibold text-slate-900">{shuttle?.route_name ?? "No active route"}</span></p>
          <p className="mt-1 text-3xl font-semibold text-teal-800">{serviceState === "active" ? "Active" : serviceState === "maintenance" ? "Maintenance" : "Inactive"}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-semibold text-slate-500">Service status</p><p className={`mt-3 text-2xl font-semibold ${serviceStatusColor}`}>{serviceStatusText}</p><p className="mt-2 text-sm text-slate-600">{serviceState === "active" ? "Most campus routes are running normally." : serviceState === "maintenance" ? "This shuttle is temporarily unavailable." : "This shuttle is currently inactive."}</p></div>
      </div>
      <div className="mt-8 flex flex-wrap gap-3"><Link className="rounded-md bg-teal-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-800" to="/track-shuttle">Track Shuttle</Link><Link className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50" to="/notifications">Notifications</Link></div>
    </section>
  );
}

export default Dashboard;
