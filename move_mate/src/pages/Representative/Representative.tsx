import { FormEvent, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  createRoute,
  createShuttle,
  addRouteStop,
  deleteShuttle,
  getRoutes,
  getShuttles,
  updateShuttleStatus,
  type ApiRoute,
  type ApiShuttle,
} from "../../services/transitApi";

function Representative() {
  const { user } = useAuth();
  const [shuttles, setShuttles] = useState<ApiShuttle[]>([]);
  const [routes, setRoutes] = useState<ApiRoute[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [shuttleForm, setShuttleForm] = useState({ name: "", plate_number: "", status: "active", current_route_id: "" });
  const [routeForm, setRouteForm] = useState({ name: "", description: "", start_location: "", end_location: "" });
  const [stopForm, setStopForm] = useState({ routeId: "", name: "", latitude: "", longitude: "", stop_order: "1" });

  const loadData = async () => {
    const [loadedShuttles, loadedRoutes] = await Promise.all([getShuttles(), getRoutes()]);
    setShuttles(loadedShuttles);
    setRoutes(loadedRoutes);
  };

  useEffect(() => {
    loadData().catch((requestError: Error) => setError(requestError.message));
  }, []);

  if (user?.role !== "admin" && user?.role !== "representative") {
    return <Navigate to="/dashboard" replace />;
  }

  const handleShuttleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      await createShuttle({
        name: shuttleForm.name,
        plate_number: shuttleForm.plate_number || undefined,
        status: shuttleForm.status,
        current_route_id: shuttleForm.current_route_id ? Number(shuttleForm.current_route_id) : null,
      });
      setShuttleForm({ name: "", plate_number: "", status: "active", current_route_id: "" });
      await loadData();
      setMessage("Shuttle added successfully.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not add shuttle.");
    }
  };

  const handleRouteSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      await createRoute(routeForm);
      setRouteForm({ name: "", description: "", start_location: "", end_location: "" });
      await loadData();
      setMessage("Route added successfully.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not add route.");
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    setError("");
    try {
      const updated = await updateShuttleStatus(id, status);
      setShuttles((current) => current.map((shuttle) => shuttle.id === id ? { ...shuttle, ...updated } : shuttle));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not update shuttle.");
    }
  };

  const handleStopSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      await addRouteStop(Number(stopForm.routeId), { name: stopForm.name, latitude: Number(stopForm.latitude), longitude: Number(stopForm.longitude), stop_order: Number(stopForm.stop_order) });
      setStopForm({ ...stopForm, name: "", latitude: "", longitude: "" });
      setMessage("Stop added successfully.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not add stop.");
    }
  };

  const handleDeleteShuttle = async (shuttle: ApiShuttle) => {
    if (!window.confirm(`Remove ${shuttle.name}? This also removes its location history.`)) return;

    setError("");
    setMessage("");
    try {
      await deleteShuttle(shuttle.id);
      setShuttles((current) => current.filter((item) => item.id !== shuttle.id));
      setMessage("Shuttle removed successfully.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not remove shuttle.");
    }
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-10">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-700">Operations console</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">Manage MoveMate</h1>
      <p className="mt-3 text-slate-600">Add routes and shuttles, then update service status from one place.</p>

      {(error || message) && <p className={`mt-6 rounded-md p-4 text-sm ${error ? "bg-red-50 text-red-700" : "bg-teal-50 text-teal-800"}`} role="status">{error || message}</p>}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <form className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" onSubmit={handleShuttleSubmit}>
          <h2 className="text-lg font-semibold text-slate-900">Add shuttle</h2>
          <div className="mt-4 space-y-3">
            <input className="w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Shuttle name" value={shuttleForm.name} onChange={(event) => setShuttleForm({ ...shuttleForm, name: event.target.value })} required />
            <input className="w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Plate number" value={shuttleForm.plate_number} onChange={(event) => setShuttleForm({ ...shuttleForm, plate_number: event.target.value })} />
            <select className="w-full rounded-md border border-slate-300 px-3 py-2" value={shuttleForm.current_route_id} onChange={(event) => setShuttleForm({ ...shuttleForm, current_route_id: event.target.value })}>
              <option value="">No route yet</option>
              {routes.map((route) => <option key={route.id} value={route.id}>{route.name}</option>)}
            </select>
          </div>
          <button className="mt-4 rounded-md bg-teal-700 px-4 py-2 font-medium text-white hover:bg-teal-800" type="submit">Add shuttle</button>
        </form>

        <form className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" onSubmit={handleRouteSubmit}>
          <h2 className="text-lg font-semibold text-slate-900">Add route</h2>
          <div className="mt-4 space-y-3">
            <input className="w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Route name" value={routeForm.name} onChange={(event) => setRouteForm({ ...routeForm, name: event.target.value })} required />
            <input className="w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Description" value={routeForm.description} onChange={(event) => setRouteForm({ ...routeForm, description: event.target.value })} />
            <div className="grid gap-3 sm:grid-cols-2"><input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Start location" value={routeForm.start_location} onChange={(event) => setRouteForm({ ...routeForm, start_location: event.target.value })} /><input className="rounded-md border border-slate-300 px-3 py-2" placeholder="End location" value={routeForm.end_location} onChange={(event) => setRouteForm({ ...routeForm, end_location: event.target.value })} /></div>
          </div>
          <button className="mt-4 rounded-md bg-teal-700 px-4 py-2 font-medium text-white hover:bg-teal-800" type="submit">Add route</button>
        </form>
      </div>

      <form className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm" onSubmit={handleStopSubmit}>
        <h2 className="text-lg font-semibold text-slate-900">Add route stop</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <select className="rounded-md border border-slate-300 px-3 py-2" value={stopForm.routeId} onChange={(event) => setStopForm({ ...stopForm, routeId: event.target.value })} required><option value="">Choose route</option>{routes.map((route) => <option key={route.id} value={route.id}>{route.name}</option>)}</select>
          <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Stop name" value={stopForm.name} onChange={(event) => setStopForm({ ...stopForm, name: event.target.value })} required />
          <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Latitude" type="number" step="any" value={stopForm.latitude} onChange={(event) => setStopForm({ ...stopForm, latitude: event.target.value })} required />
          <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Longitude" type="number" step="any" value={stopForm.longitude} onChange={(event) => setStopForm({ ...stopForm, longitude: event.target.value })} required />
          <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Order" type="number" min="1" value={stopForm.stop_order} onChange={(event) => setStopForm({ ...stopForm, stop_order: event.target.value })} required />
        </div>
        <button className="mt-4 rounded-md bg-teal-700 px-4 py-2 font-medium text-white hover:bg-teal-800" type="submit">Add stop</button>
      </form>

      <div className="mt-8 overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4"><h2 className="font-semibold text-slate-900">Current shuttles</h2></div>
        <table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Shuttle</th><th className="px-5 py-3">Route</th><th className="px-5 py-3">Location</th><th className="px-5 py-3">Status</th>{user?.role === "admin" && <th className="px-5 py-3">Actions</th>}</tr></thead><tbody className="divide-y divide-slate-200">{shuttles.map((shuttle) => <tr key={shuttle.id}><td className="px-5 py-4 font-semibold text-slate-900">{shuttle.name}<span className="block text-xs font-normal text-slate-500">{shuttle.plate_number || "No plate number"}</span></td><td className="px-5 py-4 text-slate-600">{shuttle.route_name || "Unassigned"}</td><td className="px-5 py-4 text-slate-600">{shuttle.place_name || "No location yet"}</td><td className="px-5 py-4"><select className="rounded-md border border-slate-300 px-2 py-1 text-slate-700" value={shuttle.status} onChange={(event) => handleStatusChange(shuttle.id, event.target.value)}><option value="active">Active</option><option value="inactive">Inactive</option><option value="maintenance">Maintenance</option></select></td>{user?.role === "admin" && <td className="px-5 py-4"><button className="rounded-md border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-50" type="button" onClick={() => handleDeleteShuttle(shuttle)}>Remove</button></td>}</tr>)}</tbody></table>
      </div>
    </section>
  );
}

export default Representative;
