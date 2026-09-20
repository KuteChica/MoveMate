import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getRouteStops, getRoutes, type ApiRoute } from "../../services/transitApi";

type ShuttleRoute = {
  id: number;
  name: string;
  destination: string;
  departure: string;
  arrival: string;
  status: "On time" | "Approaching" | "Delayed";
  minutesAway: number;
  stops: string[];
  travelTime: string;
};

function Routes() {
  const [shuttleRoutes, setShuttleRoutes] = useState<ShuttleRoute[]>([]);
  const [destination, setDestination] = useState("All destinations");
  const [time, setTime] = useState("Now");
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [routeStops, setRouteStops] = useState<Record<number, string[]>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    getRoutes()
      .then((routes: ApiRoute[]) => setShuttleRoutes(routes.map((route) => ({
        id: route.id,
        name: route.name,
        destination: route.end_location || "Campus",
        departure: "Now",
        arrival: "Live service",
        status: route.active ? "On time" : "Delayed",
        minutesAway: 0,
        stops: routeStops[route.id] || [],
        travelTime: "Live route",
      }))))
      .catch((requestError: Error) => setError(requestError.message));
  }, []);

  useEffect(() => {
    const route = shuttleRoutes.find((item) => item.name === selectedRoute);
    if (!route || routeStops[route.id]) return;
    getRouteStops(route.id)
      .then((stops) => {
        setRouteStops((current) => ({ ...current, [route.id]: stops.map((stop) => stop.name) }));
      })
      .catch((requestError: Error) => setError(requestError.message));
  }, [selectedRoute, shuttleRoutes, routeStops]);

  const hydratedRoutes = shuttleRoutes.map((route) => ({
    ...route,
    stops: routeStops[route.id] || route.stops,
  }));

  const destinations = [
    "All destinations",
    ...new Set(shuttleRoutes.map((route) => route.destination)),
  ];

  const visibleRoutes = useMemo(
    () =>
      hydratedRoutes.filter(
        (route) =>
          destination === "All destinations" || route.destination === destination,
      ),
    [destination, hydratedRoutes],
  );

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link className="text-sm font-semibold text-teal-700 transition hover:text-teal-900" to="/dashboard">← Back to dashboard</Link>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.14em] text-teal-700">Campus transit</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Find your route</h1>
          <p className="mt-3 max-w-2xl text-slate-600">Compare destinations, departure times, and stops before you start your journey.</p>
        </div>
        <Link className="rounded-md border border-teal-700 px-4 py-2.5 text-sm font-semibold text-teal-800 transition hover:bg-teal-50" to="/track-shuttle">Track a shuttle →</Link>
      </div>

      {error && <p className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700" role="alert">{error}</p>}
      <div className="mb-6 grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Destination
          <select
            className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-normal text-slate-900 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
          >
            {destinations.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Departing
          <select
            className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-normal text-slate-900 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            value={time}
            onChange={(event) => setTime(event.target.value)}
          >
            <option>Now</option>
            <option>Next hour</option>
            <option>Tomorrow morning</option>
          </select>
        </label>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-5">
          <div><h2 className="font-semibold text-slate-900">Available shuttles</h2><p className="mt-1 text-sm text-slate-500">Showing routes departing {time.toLowerCase()}.</p></div>
          <span className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800">{visibleRoutes.length} routes found</span>
        </div>
        <div className="divide-y divide-slate-200">
          {visibleRoutes.map((route) => (
            <div className="px-5 py-5 transition hover:bg-teal-50" key={route.name}>
              <button className="grid w-full gap-3 text-left sm:grid-cols-[1fr_auto] sm:items-center" type="button" onClick={() => setSelectedRoute(selectedRoute === route.name ? null : route.name)} aria-expanded={selectedRoute === route.name}>
                <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-semibold text-slate-900">{route.name}</h3>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      route.status === "Delayed"
                        ? "bg-amber-100 text-amber-800"
                        : route.status === "Approaching"
                          ? "bg-teal-100 text-teal-800"
                          : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {route.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{route.destination}</p>
                </div>
                <div className="text-left sm:text-right">
                <p className="font-semibold text-slate-900">{route.minutesAway} min away</p>
                <p className="mt-1 text-sm text-slate-500">{route.departure} - {route.arrival}</p>
                </div>
              </button>
              {selectedRoute === route.name && <div className="mt-5 border-t border-slate-200 pt-5"><div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Stops</p><div className="mt-3 flex flex-wrap items-center gap-2">{route.stops.map((stop, index) => <span className="flex items-center gap-2" key={`${route.name}-${stop}-${index}`}><span className="rounded-md bg-slate-100 px-2.5 py-1.5 text-sm font-medium text-slate-800">{stop}</span>{index < route.stops.length - 1 && <span className="text-teal-600">→</span>}</span>)}</div></div><div className="rounded-md bg-teal-50 px-4 py-3 text-sm text-teal-900"><span className="block text-xs font-semibold uppercase tracking-[0.1em] text-teal-700">Travel time</span><span className="mt-1 block font-semibold">{route.travelTime}</span></div></div><Link className="mt-5 inline-block text-sm font-semibold text-teal-700 hover:text-teal-900" to="/track-shuttle">Track a shuttle on this route →</Link></div>}
            </div>
          ))}
          {visibleRoutes.length === 0 && (
            <p className="px-5 py-8 text-sm text-slate-600">No shuttles match this destination.</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default Routes;
