import { useEffect, useState } from "react";
import { getNotifications, type ApiNotification } from "../../services/transitApi";

function Notifications() {
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getNotifications().then(setNotifications).catch((requestError: Error) => setError(requestError.message));
  }, []);

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-10">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-700">Stay informed</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">Notifications</h1>
      <p className="mt-3 max-w-2xl text-slate-600">Important updates about your campus shuttle service.</p>
      {error && <p className="mt-6 rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      <div className="mt-8 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm">
        {notifications.length === 0 && !error && <p className="px-5 py-8 text-sm text-slate-600">No notifications yet.</p>}
        {notifications.map((notification) => (
          <article className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between" key={notification.id}>
            <div><span className="rounded-full bg-teal-100 px-2.5 py-1 text-xs font-semibold text-teal-800">Update</span><h2 className="mt-2 font-semibold text-slate-900">{notification.title}</h2><p className="mt-1 text-sm text-slate-600">{notification.message}</p></div>
            <time className="text-xs text-slate-500">{new Date(notification.created_at).toLocaleString()}</time>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Notifications;
