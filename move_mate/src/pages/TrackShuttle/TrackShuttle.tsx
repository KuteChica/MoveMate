import { useState } from "react";

type Shuttle = {
  name: string;
  location: string;
  nextStop: string;
  minutesAway: number;
  status: "Approaching" | "On route" | "Delayed";
};

const shuttles: Shuttle[] = [
  {
    name: "Shuttle A",
    location: "Main Gate",
    nextStop: "Administration Block",
    minutesAway: 4,
    status: "Approaching",
  },
  {
    name: "Shuttle B",
    location: "Library",
    nextStop: "Bani Hostel",
    minutesAway: 12,
    status: "On route",
  },
  {
    name: "Shuttle C",
    location: "Hostel",
    nextStop: "Lecture Hall",
    minutesAway: 19,
    status: "Delayed",
  },
];

function TrackShuttle() {
  const [selectedShuttle, setSelectedShuttle] = useState(shuttles[0].name);
  const shuttle = shuttles.find((item) => item.name === selectedShuttle) ?? shuttles[0];

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-teal-700">
          Live tracking
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Track your shuttle</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Choose a shuttle to see its current status, next stop, and estimated arrival.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <label className="rounded-lg border border-slate-200 bg-white p-5 text-sm font-medium text-slate-700 shadow-sm">
          Select a shuttle
          <select
            className="mt-3 w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-normal text-slate-900 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            value={selectedShuttle}
            onChange={(event) => setSelectedShuttle(event.target.value)}
          >
            {shuttles.map((item) => (
              <option key={item.name}>{item.name}</option>
            ))}
          </select>
          <span className="mt-5 block text-xs font-normal uppercase tracking-[0.12em] text-slate-500">
            Current location
          </span>
          <span className="mt-1 block text-lg font-semibold text-slate-900">{shuttle.location}</span>
        </label>

        <div className="relative min-h-64 overflow-hidden rounded-lg border border-teal-100 bg-[#dceeed] p-6 shadow-sm">
          <div className="absolute left-[-10%] top-1/2 h-16 w-[120%] rotate-[-12deg] border-y-8 border-white/80 bg-[#badbd7]" />
          <div className="absolute left-[18%] top-[28%] h-4 w-4 rounded-full border-2 border-white bg-[#007d7b] shadow-[0_0_0_5px_rgba(0,125,123,0.2)]" />
          <div className="absolute right-[24%] top-[52%] h-4 w-4 rounded-full border-2 border-white bg-[#ed9d36] shadow-[0_0_0_5px_rgba(237,157,54,0.2)]" />
          <div className="absolute bottom-4 left-4 rounded-md bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700">Campus map · sample locations</div>
          <div className="relative z-[1] ml-auto max-w-xs rounded-lg bg-white/95 p-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-teal-800">{shuttle.name}</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">{shuttle.minutesAway} min</p>
              <p className="mt-1 text-sm text-slate-600">estimated arrival</p>
            </div>
            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-teal-800">
              {shuttle.status}
            </span>
          </div>
          <div className="mt-8 border-t border-teal-100 pt-4 text-sm text-slate-700">
            Next stop: <span className="font-semibold text-slate-900">{shuttle.nextStop}</span>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TrackShuttle;
