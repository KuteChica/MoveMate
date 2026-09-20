import { useEffect, useState } from "react";
import { getShuttles, type ApiShuttle } from "../services/transitApi";

const decisionStorageKey = "movemate-location-decision";

type Coordinates = {
  latitude: number;
  longitude: number;
};

function distanceInKilometres(from: Coordinates, to: Coordinates) {
  const latitudeDifference = (to.latitude - from.latitude) * 111;
  const longitudeDifference = (to.longitude - from.longitude) * 111;
  return Math.sqrt(latitudeDifference ** 2 + longitudeDifference ** 2);
}

function LocationPrompt() {
  const [decision, setDecision] = useState(() => localStorage.getItem(decisionStorageKey));
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [shuttle, setShuttle] = useState<ApiShuttle | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (decision !== "allowed" || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setCoordinates({ latitude: coords.latitude, longitude: coords.longitude }),
      () => setError("Location access was unavailable. You can enable it in your browser settings."),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, [decision]);

  useEffect(() => {
    if (!coordinates) return;
    getShuttles()
      .then((shuttles) => {
        const available = shuttles.filter((item) => item.latitude !== null && item.longitude !== null);
        const nearest = available.reduce<{ shuttle: ApiShuttle; distance: number } | null>((current, item) => {
          const distance = distanceInKilometres(coordinates, { latitude: item.latitude!, longitude: item.longitude! });
          return !current || distance < current.distance ? { shuttle: item, distance } : current;
        }, null);
        setShuttle(nearest?.shuttle || null);
      })
      .catch(() => setError("We could not load shuttle locations right now."));
  }, [coordinates]);

  const chooseLocation = () => {
    localStorage.setItem(decisionStorageKey, "allowed");
    setDecision("allowed");
    setError("");
  };

  const dismiss = () => {
    localStorage.setItem(decisionStorageKey, "dismissed");
    setDecision("dismissed");
  };

  if (decision === "dismissed") return null;

  if (!decision) {
    return (
      <aside className="border-b border-teal-100 bg-teal-50 px-4 py-3" aria-label="Location permission">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-teal-950">Allow MoveMate to use your location for a nearby shuttle ETA.</p>
          <div className="flex gap-2"><button className="rounded-md bg-teal-700 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800" type="button" onClick={chooseLocation}>Allow location</button><button className="rounded-md border border-teal-700 px-3 py-2 text-sm font-semibold text-teal-800 hover:bg-white" type="button" onClick={dismiss}>Not now</button></div>
        </div>
      </aside>
    );
  }

  if (error) return <aside className="border-b border-amber-100 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900">{error}</aside>;
  if (!coordinates || !shuttle) return null;

  return <aside className="border-b border-teal-100 bg-teal-50 px-4 py-2 text-center text-sm text-teal-950">Nearest shuttle: <strong>{shuttle.name}</strong>{shuttle.speed_kmh && shuttle.speed_kmh > 0 ? `, approximately ${Math.max(1, Math.round((distanceInKilometres(coordinates, { latitude: shuttle.latitude!, longitude: shuttle.longitude! }) / shuttle.speed_kmh) * 60))} minutes away` : ". Waiting for a fresh GPS speed update."}</aside>;
}

export default LocationPrompt;
