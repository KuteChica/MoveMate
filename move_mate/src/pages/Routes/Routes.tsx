import { useMemo, useState } from "react";

type ShuttleRoute = {
  name: string;
  destination: string;
  departure: string;
  arrival: string;
  status: "On time" | "Approaching" | "Delayed";
  minutesAway: number;
};

const shuttleRoutes: ShuttleRoute[] = [
  {
    name: "North Loop",
    destination: "North Campus",
    departure: "8:00 AM",
    arrival: "8:20 AM",
    status: "Approaching",
    minutesAway: 4,
  },
  {
    name: "Library Express",
    destination: "Main Library",
    departure: "8:15 AM",
    arrival: "8:28 AM",
    status: "On time",
    minutesAway: 12,
  },
  {
    name: "Residence Loop",
    destination: "Student Residences",
    departure: "8:30 AM",
    arrival: "8:48 AM",
    status: "Delayed",
    minutesAway: 19,
  },
  {
    name: "Science Connector",
    destination: "Science Building",
    departure: "8:45 AM",
    arrival: "9:00 AM",
    status: "On time",
    minutesAway: 27,
  },
];

function Routes() {
  const [destination, setDestination] = useState("All destinations");
  const [time, setTime] = useState("Now");

  const destinations = [
    "All destinations",
    ...new Set(shuttleRoutes.map((route) => route.destination)),
  ];

  const visibleRoutes = useMemo(
    () =>
      shuttleRoutes.filter(
        (route) =>
          destination === "All destinations" || route.destination === destination,
      ),
    [destination],
  );

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-teal-700">
          Campus transit
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Shuttle routes</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          See the next shuttle for your destination and plan your trip around its live schedule.
        </p>
      </div>

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
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-900">Available shuttles</h2>
          <p className="mt-1 text-sm text-slate-500">Showing routes departing {time.toLowerCase()}.</p>
        </div>
        <div className="divide-y divide-slate-200">
          {visibleRoutes.map((route) => (
            <article className="grid gap-3 px-5 py-5 sm:grid-cols-[1fr_auto] sm:items-center" key={route.name}>
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
            </article>
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
