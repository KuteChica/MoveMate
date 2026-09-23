import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getLocationHistory, getRouteStops, getShuttleEta, getShuttles, type ApiEta, type ApiShuttle, type ApiStop } from "../../services/transitApi";
import MoveMateMap from "../../components/map/MoveMateMap";

type Shuttle = {
  id: number;
  name: string;
  location: string;
  nextStop: string;
  minutesAway: number;
  status: "Approaching" | "On route" | "Delayed";
  routeId: number | null;
  latitude: number | null;
  longitude: number | null;
  speedKmh: number | null;
  recordedAt: string | null;
};

function TrackShuttle() {
  const [shuttles, setShuttles] = useState<Shuttle[]>([]);
  const [selectedShuttle, setSelectedShuttle] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState<Array<{ id: number; place_name: string | null; speed_kmh: number | null; recorded_at: string }>>([]);
  const [stops, setStops] = useState<ApiStop[]>([]);
  const [eta, setEta] = useState<ApiEta | null>(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    getShuttles()
      .then((items: ApiShuttle[]) => {
        const mapped = items.map((item) => ({
          id: item.id,
          name: item.name,
          location: item.place_name || "Location unavailable",
          nextStop: item.route_name || "Next stop unavailable",
          minutesAway: 0,
          status: item.status === "maintenance" ? "Delayed" : item.status === "active" ? "Approaching" : "On route",
          routeId: item.current_route_id,
          latitude: item.latitude,
          longitude: item.longitude,
          speedKmh: item.speed_kmh || null,
          recordedAt: item.recorded_at,
        }));
        setShuttles(mapped);
        const requestedShuttle = searchParams.get("shuttle");
        const requested = mapped.find((item) => String(item.id) === requestedShuttle);
        setSelectedShuttle((current) => current || requested?.name || mapped[0]?.name || "");
      })
      .catch((requestError: Error) => setError(requestError.message));
  }, [searchParams]);

  const shuttle = shuttles.find((item) => item.name === selectedShuttle);

  useEffect(() => {
    if (!shuttle) return;
    getLocationHistory(shuttle.id).then(setHistory).catch((requestError: Error) => setError(requestError.message));
    if (shuttle.routeId) getRouteStops(shuttle.routeId).then(setStops).catch((requestError: Error) => setError(requestError.message));
    getShuttleEta(shuttle.id).then(setEta).catch(() => setEta(null));
  }, [shuttle?.id, shuttle?.routeId]);

  const nearestStop = shuttle && stops.length && shuttle.latitude !== null && shuttle.longitude !== null
    ? stops.reduce((nearest, stop) => {
      const distance = Math.hypot((stop.latitude - shuttle.latitude) * 111, (stop.longitude - shuttle.longitude) * 111);
      return !nearest || distance < nearest.distance ? { stop, distance } : nearest;
    }, null as { stop: ApiStop; distance: number } | null)
    : null;
  const fallbackEstimatedMinutes = nearestStop && shuttle?.speedKmh && shuttle.speedKmh > 0
    ? Math.max(1, Math.round((nearestStop.distance / shuttle.speedKmh) * 60))
    : null;
  const estimatedMinutes = eta?.estimated_minutes ?? fallbackEstimatedMinutes;
  const displayedNextStop = eta?.next_stop?.name || nearestStop?.stop.name || shuttle?.nextStop || "Next stop unavailable";

  if (error) {
    return <section className="mx-auto w-full max-w-6xl px-4 py-10"><p className="rounded-md bg-red-50 p-4 text-sm text-red-700" role="alert">{error}</p></section>;
  }

  if (!shuttle) {
    return <section className="mx-auto w-full max-w-6xl px-4 py-10"><p className="text-sm text-slate-600">No shuttles are currently available.</p></section>;
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link className="text-sm font-semibold text-teal-700 transition hover:text-teal-900" to="/dashboard">
            ← Back to dashboard
          </Link>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.14em] text-teal-700">Live tracking</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Track your shuttle</h1>
          <p className="mt-3 max-w-2xl text-slate-600">Follow your shuttle across campus and see when it will reach the next stop.</p>
        </div>
        <Link className="rounded-md border border-teal-700 px-4 py-2.5 text-sm font-semibold text-teal-800 transition hover:bg-teal-50" to="/routes">
          View all routes →
        </Link>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Selected shuttle</p><p className="mt-2 text-lg font-semibold text-slate-900">{shuttle.name}</p></div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Current location</p><p className="mt-2 text-lg font-semibold text-slate-900">{shuttle.location}</p></div>
          <div className="rounded-lg border border-teal-100 bg-teal-50 p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal-700">Estimated arrival</p><p className="mt-2 text-lg font-semibold text-teal-900">{estimatedMinutes ? `${estimatedMinutes} minutes` : "Waiting for GPS"}</p><p className="mt-1 text-xs text-teal-800">Next stop: {displayedNextStop}</p></div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
        <div className="space-y-5">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <label className="text-sm font-semibold text-slate-800">Choose a shuttle
              <select className="mt-3 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 font-normal text-slate-900 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100" value={selectedShuttle} onChange={(event) => setSelectedShuttle(event.target.value)}>
                {shuttles.map((item) => <option key={item.name}>{item.name}</option>)}
              </select>
            </label>
            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-sm text-slate-500">Service status</span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${shuttle.status === "Delayed" ? "bg-amber-100 text-amber-800" : shuttle.status === "Approaching" ? "bg-teal-100 text-teal-800" : "bg-emerald-100 text-emerald-800"}`}>{shuttle.status}</span>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Journey progress</p>
            <div className="mt-5 space-y-5">
              <div className="flex gap-3"><span className="mt-1 h-3 w-3 rounded-full bg-teal-700 ring-4 ring-teal-100" /><div><p className="text-sm font-semibold text-slate-900">{shuttle.location}</p><p className="text-xs text-slate-500">Current location</p></div></div>
              <div className="ml-1.5 h-8 border-l-2 border-dashed border-teal-200" />
              <div className="flex gap-3"><span className="mt-1 h-3 w-3 rounded-full border-2 border-teal-600 bg-white" /><div><p className="text-sm font-semibold text-slate-900">{displayedNextStop}</p><p className="text-xs text-slate-500">{estimatedMinutes ? `Estimated · ${estimatedMinutes} min away` : "Waiting for a GPS update"}</p></div></div>
            </div>
          </div>
        </div>

        <div className="min-h-[27rem] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <MoveMateMap shuttle={{ name: shuttle.name, latitude: shuttle.latitude, longitude: shuttle.longitude, recordedAt: shuttle.recordedAt }} stops={stops} />
          <div className="flex items-center justify-between gap-4 border-t border-slate-100 bg-white px-5 py-4">
            <div><p className="text-sm font-semibold text-teal-800">{shuttle.name}</p><p className="mt-1 text-sm text-slate-600">Until {displayedNextStop}</p></div>
            <Link className="text-sm font-semibold text-teal-700 hover:text-teal-900" to="/routes">Route details →</Link>
          </div>
        </div>
      </div>
      {history.length > 0 && <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-semibold text-slate-900">Recent GPS updates</h2><div className="mt-3 space-y-2 text-sm text-slate-600">{history.slice(0, 5).map((location) => <p key={location.id}>{location.place_name || "Coordinates received"} · {location.speed_kmh ?? "--"} km/h · {new Date(location.recorded_at).toLocaleString()}</p>)}</div></div>}
    </section>
  );
}

export default TrackShuttle;
