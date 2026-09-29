import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L, { type LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import type { ApiStop } from "../../services/transitApi";

type ShuttleMapData = {
  id?: number;
  name: string;
  latitude: number | null;
  longitude: number | null;
  recordedAt: string | null;
};

type MoveMateMapProps = {
  shuttle?: ShuttleMapData;
  shuttles?: ShuttleMapData[];
  selectedShuttleId?: number | null;
  stops: ApiStop[];
  showStudentLocation?: boolean;
  onStudentLocationChange?: (location: [number, number]) => void;
};

const campusCenter: LatLngExpression = [5.6508, -0.1869];

function createMarkerIcon(color: string, symbol: string, label?: string, isBus = true) {
  const labelMarkup = label ? `<div style="font-size:10px;line-height:1.1;font-weight:700;letter-spacing:0.04em;color:#0f172a;background:rgba(255,255,255,0.88);padding:3px 6px;border-radius:999px;box-shadow:0 2px 8px rgba(15,23,42,0.15);margin-bottom:4px;white-space:nowrap;">${label}</div>` : "";

  return L.divIcon({
    className: "movemate-map-marker",
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;transform:translateY(-4px);">
        ${labelMarkup}
        <span style="display:flex;align-items:center;justify-content:center;width:38px;height:38px;border:3px solid white;border-radius:${isBus ? '12px' : '50%'};background:${color};color:white;font-weight:700;font-size:${isBus ? '18px' : '14px'};box-shadow:0 2px 6px rgba(15,23,42,.35)">${symbol}</span>
      </div>
    `,
    iconAnchor: [19, 32],
    popupAnchor: [0, -20],
  });
}

const studentIcon = createMarkerIcon("#1d4ed8", "YOU", undefined, false);

function MapInteractionTracker({ interacted }: { interacted: React.MutableRefObject<boolean> }) {
  useMapEvents({
    dragstart: () => { interacted.current = true; },
    zoomstart: () => { interacted.current = true; },
  });
  return null;
}

function FitMapToData({ shuttles, stops, fitKey, selectedShuttleId }: { shuttles: ShuttleMapData[]; stops: ApiStop[]; fitKey: string; selectedShuttleId?: number | null }) {
  const map = useMap();
  const interacted = useRef(false);
  const fittedKey = useRef("");
  const previousSelectedShuttleId = useRef(selectedShuttleId);

  useEffect(() => {
    if (previousSelectedShuttleId.current !== selectedShuttleId) {
      previousSelectedShuttleId.current = selectedShuttleId;
      interacted.current = false;
      fittedKey.current = "";
    }
    if (interacted.current || fittedKey.current === fitKey) return;

    const selectedShuttle = shuttles.find((item) => item.id === selectedShuttleId);
    if (selectedShuttle && selectedShuttle.latitude !== null && selectedShuttle.longitude !== null) {
      fittedKey.current = fitKey;
      map.setView([selectedShuttle.latitude, selectedShuttle.longitude], 16);
      return;
    }

    const points: LatLngExpression[] = stops.map((stop) => [stop.latitude, stop.longitude]);
    shuttles.forEach((shuttle) => {
      if (shuttle.latitude !== null && shuttle.longitude !== null) {
        points.push([shuttle.latitude, shuttle.longitude]);
      }
    });
    if (points.length === 0) return;

    fittedKey.current = fitKey;
    if (points.length === 1) {
      map.setView(points[0], 15);
    } else {
      map.fitBounds(L.latLngBounds(points), { padding: [28, 28], maxZoom: 16 });
    }
  }, [fitKey, map, selectedShuttleId, shuttles, stops]);

  return <MapInteractionTracker interacted={interacted} />;
}

function formatDistance(distanceKm: number) {
  return distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m away` : `${distanceKm.toFixed(1)} km away`;
}

function distanceInKm(first: [number, number], second: [number, number]) {
  const earthRadiusKm = 6371;
  const latitudeDelta = (second[0] - first[0]) * Math.PI / 180;
  const longitudeDelta = (second[1] - first[1]) * Math.PI / 180;
  const a = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(first[0] * Math.PI / 180) * Math.cos(second[0] * Math.PI / 180) * Math.sin(longitudeDelta / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function MoveMateMap({ shuttle, shuttles, selectedShuttleId, stops, showStudentLocation = true, onStudentLocationChange }: MoveMateMapProps) {
  const [studentLocation, setStudentLocation] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState("");

  const liveShuttles = useMemo(() => {
    const source = shuttles && shuttles.length > 0 ? shuttles : shuttle ? [shuttle] : [];
    return source.filter((item) => item.latitude !== null && item.longitude !== null);
  }, [shuttle, shuttles]);
  const selectedShuttle = selectedShuttleId == null
    ? null
    : liveShuttles.find((item) => item.id === selectedShuttleId) ?? null;
  const visibleShuttles = selectedShuttleId == null
    ? liveShuttles
    : selectedShuttle ? [selectedShuttle] : [];

  useEffect(() => {
    if (!showStudentLocation) return undefined;
    if (!navigator.geolocation) {
      setLocationError("Location is not available in this browser.");
      return undefined;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const nextLocation: [number, number] = [position.coords.latitude, position.coords.longitude];
        setStudentLocation(nextLocation);
        onStudentLocationChange?.(nextLocation);
        setLocationError("");
      },
      () => setLocationError("Allow location access to show your position and distance."),
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [showStudentLocation]);

  const routePath = useMemo<LatLngExpression[]>(
    () => stops.map((stop) => [stop.latitude, stop.longitude]),
    [stops],
  );
  const primaryShuttle = selectedShuttleId == null ? liveShuttles[0] ?? shuttle ?? null : selectedShuttle;
  const shuttlePosition: [number, number] | null = primaryShuttle && primaryShuttle.latitude !== null && primaryShuttle.longitude !== null
    ? [primaryShuttle.latitude, primaryShuttle.longitude]
    : null;
  const distance = studentLocation && shuttlePosition ? distanceInKm(studentLocation, shuttlePosition) : null;
  const fitKey = `${selectedShuttleId ?? "all"}-${visibleShuttles.map((item) => `${item.id ?? item.name}-${item.latitude ?? "n"}-${item.longitude ?? "n"}`).join("|")}-${stops.map((stop) => stop.id).join(",")}`;

  return (
    <div className="relative h-full min-h-[23rem] w-full">
      <MapContainer className="h-full min-h-[23rem] w-full" center={campusCenter} zoom={14} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitMapToData shuttles={visibleShuttles} stops={stops} fitKey={fitKey} selectedShuttleId={selectedShuttleId} />
        {routePath.length > 1 && <Polyline positions={routePath} pathOptions={{ color: "#0f766e", weight: 5, opacity: 0.8 }} />}
        {visibleShuttles.map((activeShuttle) => {
          const selected = activeShuttle.id === selectedShuttleId || (!selectedShuttleId && activeShuttle.id === primaryShuttle?.id);
          const position: [number, number] = [activeShuttle.latitude ?? 0, activeShuttle.longitude ?? 0];

          return (
            <Marker key={activeShuttle.id ?? `${activeShuttle.name}-${activeShuttle.latitude}-${activeShuttle.longitude}`} position={position} icon={createMarkerIcon(selected ? "#0f766e" : "#0b5c6b", "🚌", activeShuttle.name, true)}>
              <Popup>
                <strong>{activeShuttle.name}</strong><br />
                {activeShuttle.recordedAt ? `Updated ${new Date(activeShuttle.recordedAt).toLocaleTimeString()}` : "GPS update received"}
              </Popup>
            </Marker>
          );
        })}
        {showStudentLocation && studentLocation && <Marker position={studentLocation} icon={studentIcon}><Popup>You are here</Popup></Marker>}
      </MapContainer>
      <div className="pointer-events-none absolute left-3 top-3 z-[1000] max-w-[calc(100%-1.5rem)] rounded-md bg-white/95 px-3 py-2 text-xs font-semibold text-slate-700 shadow-md">
        <p>{visibleShuttles.length > 0 ? `${visibleShuttles.length} live shuttle${visibleShuttles.length > 1 ? "s" : ""}` : "Waiting for selected shuttle GPS"}</p>
        {showStudentLocation && distance !== null && <p className="mt-1 font-normal text-slate-600">You are {formatDistance(distance)}</p>}
        {showStudentLocation && locationError && <p className="mt-1 font-normal text-amber-700">{locationError}</p>}
      </div>
    </div>
  );
}

export default MoveMateMap;