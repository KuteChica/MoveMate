import { FormEvent, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  createShuttle,
  assignDriver,
  createDriver,
  deleteShuttle,
  getDrivers,
  getRoutes,
  getShuttles,
  updateShuttleStatus,
  type ApiRoute,
  type ApiShuttle,
  type ApiDriver,
} from "../../services/transitApi";

function Representative() {
  const { user } = useAuth();
  const [shuttles, setShuttles] = useState<ApiShuttle[]>([]);
  const [routes, setRoutes] = useState<ApiRoute[]>([]);
  const [drivers, setDrivers] = useState<ApiDriver[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [shuttleForm, setShuttleForm] = useState({ name: "", plate_number: "", status: "active", current_route_id: "", driver_id: "", driver_phone: "" });
  const [driverForm, setDriverForm] = useState({ name: "", email: "", password: "" });

  const loadData = async () => {
    const [loadedShuttles, loadedRoutes, loadedDrivers] = await Promise.all([getShuttles(), getRoutes(), user?.role === "admin" ? getDrivers() : Promise.resolve([])]);
    setShuttles(loadedShuttles);
    setRoutes(loadedRoutes);
    setDrivers(loadedDrivers);
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
    const plateNumber = shuttleForm.plate_number.trim();
    const driverId = shuttleForm.driver_id ? Number(shuttleForm.driver_id) : null;

    if (plateNumber && shuttles.some((shuttle) => shuttle.plate_number?.toLowerCase() === plateNumber.toLowerCase())) {
      setError("This plate number is already in use by another shuttle.");
      return;
    }

    if (user?.role === "admin" && driverId && !shuttleForm.driver_phone.trim()) {
      setError("Enter the driver's phone number to assign this shuttle.");
      return;
    }

    if (user?.role === "admin" && driverId && shuttles.some((shuttle) => shuttle.driver_id === driverId)) {
      setError("This driver is already assigned to another shuttle.");
      return;
    }

    try {
      const createdShuttle = await createShuttle({
        name: shuttleForm.name,
        plate_number: plateNumber || undefined,
        status: shuttleForm.status,
        current_route_id: shuttleForm.current_route_id ? Number(shuttleForm.current_route_id) : null,
      });
      if (user?.role === "admin" && driverId) {
        await assignDriver(createdShuttle.id, { driver_id: driverId, driver_phone: shuttleForm.driver_phone.trim() });
      }
      setShuttleForm({ name: "", plate_number: "", status: "active", current_route_id: "", driver_id: "", driver_phone: "" });
      await loadData();
      setMessage("Shuttle added successfully.");
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Could not add shuttle.";
      setError(message.includes("plate") || message.includes("unique") ? "This plate number is already in use by another shuttle." : message);
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

  const handleAssignment = async (event: FormEvent<HTMLFormElement>, shuttle: ApiShuttle) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const driverId = Number(form.get("driver_id"));
    const driverPhone = String(form.get("driver_phone") || "").trim();
    if (!driverId || !driverPhone) return;
    setError("");
    try {
      await assignDriver(shuttle.id, { driver_id: driverId, driver_phone: driverPhone });
      await loadData();
      setMessage(`${shuttle.name} driver assignment updated.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not assign driver.");
    }
  };

  const handleDriverSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      await createDriver(driverForm);
      setDriverForm({ name: "", email: "", password: "" });
      await loadData();
      setMessage("Driver account created. You can now assign it to a shuttle.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not create driver account.");
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
      <p className="mt-3 text-slate-600">Manage shuttle operations and driver assignments from one place.</p>

      {(error || message) && <p className={`mt-6 rounded-md p-4 text-sm ${error ? "bg-red-50 text-red-700" : "bg-teal-50 text-teal-800"}`} role="status">{error || message}</p>}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {user?.role === "admin" && <form className="rounded-lg border border-teal-100 bg-teal-50 p-5 shadow-sm" onSubmit={handleDriverSubmit}>
          <h2 className="text-lg font-semibold text-slate-900">Add Driver Account</h2>
          <p className="mt-1 text-sm text-slate-600">Create login details for a driver, then assign the account below.</p>
          <div className="mt-4 space-y-3">
            <input className="w-full rounded-md border border-slate-300 bg-white px-3 py-2" placeholder="Driver name" value={driverForm.name} onChange={(event) => setDriverForm({ ...driverForm, name: event.target.value })} required />
            <input className="w-full rounded-md border border-slate-300 bg-white px-3 py-2" type="email" placeholder="Driver email" value={driverForm.email} onChange={(event) => setDriverForm({ ...driverForm, email: event.target.value })} required />
            <input className="w-full rounded-md border border-slate-300 bg-white px-3 py-2" type="password" minLength={6} placeholder="Temporary password" value={driverForm.password} onChange={(event) => setDriverForm({ ...driverForm, password: event.target.value })} required />
          </div>
          <button className="mt-4 rounded-md bg-teal-700 px-4 py-2 font-medium text-white hover:bg-teal-800" type="submit">Create Driver Account</button>
        </form>}
        <form className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" onSubmit={handleShuttleSubmit}>
          <h2 className="text-lg font-semibold text-slate-900">Add shuttle</h2>
          <div className="mt-4 space-y-3">
            <input className="w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Shuttle name" value={shuttleForm.name} onChange={(event) => setShuttleForm({ ...shuttleForm, name: event.target.value })} required />
            <input className="w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Plate number" value={shuttleForm.plate_number} onChange={(event) => setShuttleForm({ ...shuttleForm, plate_number: event.target.value })} />
            <select className="w-full rounded-md border border-slate-300 px-3 py-2" value={shuttleForm.current_route_id} onChange={(event) => setShuttleForm({ ...shuttleForm, current_route_id: event.target.value })}>
              <option value="">Select route</option>
              {routes.map((route) => <option key={route.id} value={route.id}>{route.name}</option>)}
            </select>
            {user?.role === "admin" && <>
              <select className="w-full rounded-md border border-slate-300 px-3 py-2" value={shuttleForm.driver_id} onChange={(event) => setShuttleForm({ ...shuttleForm, driver_id: event.target.value })}>
                <option value="">No driver assigned</option>
                {drivers.map((driver) => <option key={driver.id} value={driver.id}>{driver.name} ({driver.email})</option>)}
              </select>
              {shuttleForm.driver_id && <input className="w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Driver phone number" value={shuttleForm.driver_phone} onChange={(event) => setShuttleForm({ ...shuttleForm, driver_phone: event.target.value })} required />}
            </>}
          </div>
          <button className="mt-4 rounded-md bg-teal-700 px-4 py-2 font-medium text-white hover:bg-teal-800" type="submit">Add shuttle</button>
        </form>
      </div>

      <div className="mt-8 overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4"><h2 className="font-semibold text-slate-900">Bus Status</h2><p className="mt-1 text-sm text-slate-600">Assign each shuttle to its driver and phone number.</p></div>
        <table className="w-full min-w-[980px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Shuttle</th><th className="px-5 py-3">Route</th><th className="px-5 py-3">Driver</th><th className="px-5 py-3">Location</th><th className="px-5 py-3">Status</th>{user?.role === "admin" && <th className="px-5 py-3">Actions</th>}</tr></thead><tbody className="divide-y divide-slate-200">{shuttles.map((shuttle) => <tr key={shuttle.id}><td className="px-5 py-4 font-semibold text-slate-900">{shuttle.name}<span className="block text-xs font-normal text-slate-500">{shuttle.plate_number || "No plate number"}</span></td><td className="px-5 py-4 text-slate-600">{shuttle.route_name || "Unassigned"}</td><td className="px-5 py-4 text-slate-600">{user?.role === "admin" ? <form className="space-y-2" onSubmit={(event) => handleAssignment(event, shuttle)}><select className="rounded-md border border-slate-300 px-2 py-1" name="driver_id" defaultValue={shuttle.driver_id || ""} required><option value="">Choose driver</option>{drivers.map((driver) => <option key={driver.id} value={driver.id}>{driver.name}</option>)}</select><div className="flex gap-2"><input className="w-32 rounded-md border border-slate-300 px-2 py-1" name="driver_phone" placeholder="Phone" defaultValue={shuttle.driver_phone || ""} required /><button className="rounded-md bg-teal-700 px-2 py-1 text-xs font-semibold text-white hover:bg-teal-800" type="submit">Save</button></div></form> : <>{shuttle.driver_name || "Not assigned"}<span className="block text-xs">{shuttle.driver_phone || ""}</span></>}</td><td className="px-5 py-4 text-slate-600">{shuttle.place_name || "No location yet"}</td><td className="px-5 py-4"><select className="rounded-md border border-slate-300 px-2 py-1 text-slate-700" value={shuttle.status} onChange={(event) => handleStatusChange(shuttle.id, event.target.value)}><option value="active">Active</option><option value="inactive">Inactive</option><option value="maintenance">Maintenance</option></select></td>{user?.role === "admin" && <td className="px-5 py-4"><button className="rounded-md border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-50" type="button" onClick={() => handleDeleteShuttle(shuttle)}>Remove</button></td>}</tr>)}</tbody></table>
      </div>
    </section>
  );
}

export default Representative;
