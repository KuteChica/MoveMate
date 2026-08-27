const notifications = [
  { title: "Shuttle B is delayed", detail: "Expect a 5-minute delay near the Library.", time: "8 min ago", tone: "bg-amber-100 text-amber-800" },
  { title: "Shuttle A arriving soon", detail: "Your shuttle reaches Main Gate in 5 minutes.", time: "14 min ago", tone: "bg-teal-100 text-teal-800" },
  { title: "Route A updated", detail: "The Hostel stop has moved to the east entrance.", time: "Yesterday", tone: "bg-blue-100 text-blue-800" },
  { title: "Shuttle C unavailable", detail: "The next service is replaced by Shuttle D.", time: "Yesterday", tone: "bg-rose-100 text-rose-800" },
];

function Notifications() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-10">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-700">Stay informed</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">Notifications</h1>
      <p className="mt-3 max-w-2xl text-slate-600">Important updates about your campus shuttle service.</p>
      <div className="mt-8 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm">
        {notifications.map((notification) => (
          <article className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between" key={notification.title}>
            <div className="flex items-start gap-3"><span className={`mt-1 rounded-full px-2.5 py-1 text-xs font-semibold ${notification.tone}`}>Update</span><div><h2 className="font-semibold text-slate-900">{notification.title}</h2><p className="mt-1 text-sm text-slate-600">{notification.detail}</p></div></div>
            <time className="text-xs text-slate-500">{notification.time}</time>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Notifications;
