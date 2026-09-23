import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getShuttles, type ApiShuttle } from "../../services/transitApi";

function BusStatus() {
  const [shuttles, setShuttles] = useState<ApiShuttle[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = () => getShuttles().then(setShuttles).catch((requestError: Error) => setError(requestError.message));
    load();
    const timer = window.setInterval(load, 15000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-10">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-700">MoveMate</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">Bus Status</h1>
      <p className="mt-3 text-slate-600">See each shuttle, its assigned driver, and current service status.</p>
      {error && <p className="mt-6 rounded-md bg-red-50 p-4 text-sm text-red-700" role="alert">{error}</p>}
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {shuttles.map((shuttle) => (
          <article key={shuttle.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-semibold text-slate-900">{shuttle.name}</h2>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${shuttle.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{shuttle.status === "active" ? "Active" : "Offline"}</span>
            </div>
            <dl className="mt-5 space-y-2 text-sm">
              <div><dt className="text-slate-500">Driver</dt><dd className="font-semibold text-slate-900">{shuttle.driver_name || "Not assigned"}</dd></div>
              <div><dt className="text-slate-500">Phone</dt><dd className="font-semibold text-slate-900">{shuttle.driver_phone || "Not provided"}</dd></div>
              <div><dt className="text-slate-500">Route</dt><dd className="font-semibold text-slate-900">{shuttle.route_name || "Not assigned"}</dd></div>
              <div><dt className="text-slate-500">Last GPS update</dt><dd className="font-semibold text-slate-900">{shuttle.recorded_at ? new Date(shuttle.recorded_at).toLocaleString() : "No GPS update"}</dd></div>
            </dl>
            <Link className="mt-5 inline-block text-sm font-semibold text-teal-700 hover:text-teal-900" to={`/track-shuttle?shuttle=${shuttle.id}`}>Track shuttle →</Link>
          </article>
        ))}
      </div>
      {shuttles.length === 0 && !error && <p className="mt-8 text-sm text-slate-600">No shuttles are configured yet.</p>}
    </section>
  );
}

export default BusStatus;
