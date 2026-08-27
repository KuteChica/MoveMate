import { useState } from "react";

const initialShuttles = [
  { name: "Shuttle A", location: "Main Gate", status: "Moving" },
  { name: "Shuttle B", location: "Library", status: "Delayed" },
  { name: "Shuttle C", location: "Hostel", status: "Available" },
];

function Representative() {
  const [shuttles, setShuttles] = useState(initialShuttles);
  const [announcement, setAnnouncement] = useState("");
  const updateStatus = (name: string, status: string) => setShuttles((current) => current.map((shuttle) => shuttle.name === name ? { ...shuttle, status } : shuttle));

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-10">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-700">Operations console</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">Representative dashboard</h1>
      <p className="mt-3 text-slate-600">Manage today&apos;s service and keep students moving.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">{[["3", "Active shuttles"], ["2", "Available now"], ["1", "Delayed"]].map(([value, label]) => <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={label}><p className="text-3xl font-semibold text-slate-900">{value}</p><p className="mt-1 text-sm text-slate-500">{label}</p></div>)}</div>
      <div className="mt-8 overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm"><table className="w-full min-w-[600px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Shuttle</th><th className="px-5 py-3">Location</th><th className="px-5 py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-200">{shuttles.map((shuttle) => <tr key={shuttle.name}><td className="px-5 py-4 font-semibold text-slate-900">{shuttle.name}</td><td className="px-5 py-4 text-slate-600">{shuttle.location}</td><td className="px-5 py-4"><select className="rounded-md border border-slate-300 px-2 py-1 text-slate-700" value={shuttle.status} onChange={(event) => updateStatus(shuttle.name, event.target.value)}><option>Moving</option><option>Available</option><option>Delayed</option></select></td></tr>)}</tbody></table></div>
      <div className="mt-8 grid gap-6 md:grid-cols-2"><div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-semibold text-slate-900">Manage service</h2><div className="mt-4 flex flex-wrap gap-2"><button className="rounded-md border border-teal-700 px-3 py-2 text-sm font-medium text-teal-700 hover:bg-teal-50" type="button">Manage routes</button><button className="rounded-md border border-teal-700 px-3 py-2 text-sm font-medium text-teal-700 hover:bg-teal-50" type="button">Manage stops</button><button className="rounded-md border border-teal-700 px-3 py-2 text-sm font-medium text-teal-700 hover:bg-teal-50" type="button">View feedback</button></div></div><form className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" onSubmit={(event) => { event.preventDefault(); setAnnouncement(""); }}><h2 className="font-semibold text-slate-900">Send announcement</h2><textarea className="mt-4 min-h-20 w-full rounded-md border border-slate-300 p-3 text-sm outline-none focus:border-teal-700" placeholder="Share a service update..." value={announcement} onChange={(event) => setAnnouncement(event.target.value)} /><button className="mt-3 rounded-md bg-teal-700 px-3 py-2 text-sm font-medium text-white hover:bg-teal-800" type="submit">Publish update</button></form></div>
    </section>
  );
}

export default Representative;
