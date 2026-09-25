import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import MoveMateMap from "../../components/map/MoveMateMap";
import { getAssignedShuttle, getRouteStops, getShuttles, sendDriverLocation, type ApiShuttle, type ApiStop } from "../../services/transitApi";

function DriverDashboard() {
  const { user } = useAuth();
  const [availableShuttles, setAvailableShuttles] = useState<ApiShuttle[]>([]);
  const [shuttle, setShuttle] = useState<ApiShuttle | null>(null);
  const [stops, setStops] = useState<ApiStop[]>([]);
  const [position, setPosition] = useState<{ latitude: number; longitude: number; accuracy: number; timestamp: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState("Not Connected");
  const [error, setError] = useState("");
  const watchId = useRef<number | null>(null);
  const latestPosition = useRef<GeolocationPosition | null>(null);
  const sendTimer = useRef<number | null>(null);

  useEffect(() => {
    const loadDriverDashboard = async () => {
      try {
        const items = await getShuttles();
        setAvailableShuttles(items);

        try {
          const assigned = await getAssignedShuttle();
          const assignedShuttle = items.find((item) => item.id === assigned.id) || assigned;
          setShuttle(assignedShuttle);
        } catch {
          const assignedToUser = items.find((item) => Number(item.driver_id) === Number(user?.id));
          setShuttle(assignedToUser || null);
        }
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Could not load driver dashboard.");
      }
    };

    loadDriverDashboard();

    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
      if (sendTimer.current !== null) window.clearInterval(sendTimer.current);
    };
  }, [user?.id]);

  useEffect(() => {
    setStops([]);
    if (!shuttle?.current_route_id) return;
    getRouteStops(shuttle.current_route_id).then(setStops).catch((requestError: Error) => setError(requestError.message));
  }, [shuttle?.id, shuttle?.current_route_id]);

  if (user?.role !== "driver") return <Navigate to="/dashboard" replace />;

  const sendLatestPosition = async () => {
    const current = latestPosition.current;
    if (!current) return;
    try {
      await sendDriverLocation({
        shuttle_id: shuttle.id,
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
        accuracy: current.coords.accuracy,
        timestamp: new Date(current.timestamp).toISOString(),
      });
      setGpsStatus("Connected");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not send GPS location.");
    }
  };

  const startTracking = () => {
    setError("");
    if (!shuttle) {
      setError("Select the shuttle you are currently driving before starting GPS tracking.");
      return;
    }
    if (Number(shuttle.driver_id) !== Number(user?.id)) {
      setError("This shuttle is not assigned to your driver account. Ask an administrator to assign it first.");
      return;
    }
    if (!navigator.geolocation) {
      setGpsStatus("Unavailable");
      setError("This device does not provide browser location.");
      return;
    }
    if (watchId.current !== null) return;

    setGpsStatus("Requesting permission...");
    watchId.current = navigator.geolocation.watchPosition(
      (current) => {
        latestPosition.current = current;
        setPosition({ latitude: current.coords.latitude, longitude: current.coords.longitude, accuracy: current.coords.accuracy, timestamp: current.timestamp });
        setGpsStatus("Connected");
      },
      () => setGpsStatus("Permission denied"),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );
    sendTimer.current = window.setInterval(sendLatestPosition, 7000);
  };

  const stopTracking = () => {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    if (sendTimer.current !== null) window.clearInterval(sendTimer.current);
    watchId.current = null;
    sendTimer.current = null;
    latestPosition.current = null;
    setGpsStatus("Not Connected");
  };

  const mapShuttle = position && shuttle
    ? { name: shuttle.name, latitude: position.latitude, longitude: position.longitude, recordedAt: new Date(position.timestamp).toISOString() }
    : { name: shuttle?.name || "Selected shuttle", latitude: shuttle?.latitude ?? null, longitude: shuttle?.longitude ?? null, recordedAt: shuttle?.recorded_at || null };

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-10">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-700">Driver workspace</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">Driver Dashboard</h1>
      <div className="mt-8 grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="space-y-5">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <dl className="space-y-4 text-sm"><div><dt className="text-slate-500">Currently driving</dt><dd className="mt-1 text-lg font-semibold text-slate-900">{shuttle ? `${shuttle.name} Shuttle` : "No shuttle assigned"}</dd></div><div><dt className="text-slate-500">Assigned route</dt><dd className="mt-1 text-lg font-semibold text-slate-900">{shuttle?.route_name || "Not assigned"}</dd></div></dl>
            <label className="mt-5 block border-t border-slate-100 pt-5 text-sm font-semibold text-slate-800">Choose the shuttle you are driving<select className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 font-normal text-slate-900" value={shuttle?.id || ""} onChange={(event) => { stopTracking(); setShuttle(availableShuttles.find((item) => item.id === Number(event.target.value)) || null); }}><option value="">Select a shuttle</option>{availableShuttles.map((item) => <option key={item.id} value={item.id}>{item.name} - Driver: {item.driver_name || "Unassigned"}</option>)}</select></label>
            <div className="mt-6 border-t border-slate-100 pt-5"><p className="text-sm text-slate-500">GPS Status</p><p className={`mt-1 text-xl font-semibold ${gpsStatus === "Connected" ? "text-emerald-700" : "text-slate-700"}`}>{gpsStatus}</p><p className="mt-2 text-xs text-slate-500">Location is sent automatically while tracking is active.</p><div className="mt-4 flex gap-3"><button className="rounded-md bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50" type="button" onClick={startTracking} disabled={!shuttle || Number(shuttle.driver_id) !== Number(user?.id)}>Start Tracking</button><button className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50" type="button" onClick={stopTracking}>Stop Tracking</button></div></div>
          </div>
          {position && <p className="rounded-md bg-teal-50 p-4 text-sm text-teal-900">Accuracy: {Math.round(position.accuracy)} m · Updated {new Date(position.timestamp).toLocaleTimeString()}</p>}
          {error && <p className="rounded-md bg-red-50 p-4 text-sm text-red-700" role="alert">{error}</p>}
        </div>
        <div className="min-h-[28rem] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"><MoveMateMap shuttle={mapShuttle} stops={stops} showStudentLocation={false} /></div>
      </div>
    </section>
  );
}

export default DriverDashboard;
