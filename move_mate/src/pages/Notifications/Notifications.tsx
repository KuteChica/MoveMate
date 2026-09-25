import { useEffect, useState } from "react";
import { getNotifications, getShuttles, type ApiNotification, type ApiShuttle } from "../../services/transitApi";

async function resolvePlaceNameFromGps(latitude: number | null, longitude: number | null) {
  if (latitude === null || longitude === null || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, {
      headers: { "User-Agent": "MoveMate/1.0 campus shuttle tracker" },
    });
    if (!response.ok) return null;
    const result = await response.json();
    const address = result?.address || {};
    return address.road || address.neighbourhood || address.suburb || address.city_district || result?.display_name || null;
  } catch {
    return null;
  }
}

function formatGps(value: number | null) {
  if (value === null || Number.isNaN(value)) return "Location unavailable";
  return value.toFixed(6);
}

function getLocationDescription(shuttle: ApiShuttle) {
  if (shuttle.place_name) {
    return `${shuttle.name} is currently at ${shuttle.place_name}.`;
  }

  return `${shuttle.name} is currently on the move.`;
}

function Notifications() {
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [shuttles, setShuttles] = useState<ApiShuttle[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [notificationData, shuttleData] = await Promise.all([
          getNotifications(),
          getShuttles(),
        ]);

        const resolvedShuttles = await Promise.all(shuttleData.map(async (shuttle) => {
          if (shuttle.place_name || shuttle.latitude === null || shuttle.longitude === null) {
            return shuttle;
          }

          const exactPlace = await resolvePlaceNameFromGps(shuttle.latitude, shuttle.longitude);
          return { ...shuttle, place_name: exactPlace || shuttle.place_name };
        }));

        setNotifications(notificationData);
        setShuttles(resolvedShuttles);
      } catch (requestError: Error) {
        setError(requestError.message);
      }
    };

    load();
    const timer = window.setInterval(load, 10000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-10">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-700">Stay informed</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">Notifications</h1>
      <p className="mt-3 max-w-2xl text-slate-600">Important updates about your campus shuttle service.</p>
      {error && <p className="mt-6 rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      <div className="mt-8 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm">
        {shuttles.filter((shuttle) => shuttle.latitude !== null && shuttle.longitude !== null).map((shuttle) => (
          <article className="flex flex-col gap-2 px-5 py-5" key={`live-${shuttle.id}`}>
            <span className="w-fit rounded-full bg-teal-100 px-2.5 py-1 text-xs font-semibold text-teal-800">Live shuttle update</span>
            <h2 className="font-semibold text-slate-900">{getLocationDescription(shuttle)}</h2>
            <p className="text-sm text-slate-600">Last GPS update: {shuttle.recorded_at ? new Date(shuttle.recorded_at).toLocaleString() : "Waiting for GPS"}.</p>
          </article>
        ))}
        {notifications.length === 0 && shuttles.every((shuttle) => shuttle.latitude === null || shuttle.longitude === null) && !error && <p className="px-5 py-8 text-sm text-slate-600">No notifications yet.</p>}
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
