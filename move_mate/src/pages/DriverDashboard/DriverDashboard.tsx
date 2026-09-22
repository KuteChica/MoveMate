import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import MoveMateMap from "../../components/map/MoveMateMap";
import { getAssignedShuttle, getRouteStops, sendDriverLocation, type ApiShuttle, type ApiStop } from "../../services/transitApi";

function DriverDashboard() {
  const { user } = useAuth();
  const [shuttle, setShuttle] = useState<ApiShuttle | null>(null);
  const [stops, setStops] = useState<ApiStop[]>([]);
  const [position, setPosition] = useState<{ latitude: number; longitude: number; accuracy: number; timestamp: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState("Not Connected");
  const [error, setError] = useState("");
  const watchId = useRef<number | null>(null);
  const latestPosition = useRef<GeolocationPosition | null>(null);
  const sendTimer = useRef<number | null>(null);

  useEffect(() => {
    getAssignedShuttle()
      .then((assigned) => {
        setShuttle(assigned);
        if (assigned.current_route_id) return getRouteStops(assigned.current_route_id).then(setStops);
        return undefined;
      })
      .catch((requestError: Error) => setError(requestError.message));

    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
      if (sendTimer.current !== null) window.clearInterval(sendTimer.current);
    };
  }, []);

  if (user?.role !== "driver") return <Navigate to="/dashboard" replace />;

  const sendLatestPosition = async () => {
    const current = latestPosition.current;
    if (!current) return;
    try {
      await sendDriverLocation({
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
    : { name: shuttle?.name || "Assigned shuttle", latitude: shuttle?.latitude || null, longitude: shuttle?.longitude || null, recordedAt: shuttle?.recorded_at || null };

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-10">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-700">Driver workspace</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">Driver Dashboard</h1>
      <div className="mt-8 grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="space-y-5">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <dl className="space-y-4 text-sm"><div><dt className="text-slate-500">Driver</dt><dd className="mt-1 text-lg font-semibold text-slate-900">{user.name}</dd></div><div><dt className="text-slate-500">Assigned shuttle</dt><dd className="mt-1 text-lg font-semibold text-slate-900">{shuttle?.name || "Loading..."}</dd></div><div><dt className="text-slate-500">Assigned route</dt><dd className="mt-1 text-lg font-semibold text-slate-900">{shuttle?.route_name || "Not assigned"}</dd></div></dl>
            <div className="mt-6 border-t border-slate-100 pt-5"><p className="text-sm text-slate-500">GPS Status</p><p className={`mt-1 text-xl font-semibold ${gpsStatus === "Connected" ? "text-emerald-700" : "text-slate-700"}`}>{gpsStatus}</p><p className="mt-2 text-xs text-slate-500">Location is sent automatically while tracking is active.</p><div className="mt-4 flex gap-3"><button className="rounded-md bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800" type="button" onClick={startTracking}>Start Tracking</button><button className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50" type="button" onClick={stopTracking}>Stop Tracking</button></div></div>
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
