import { useEffect, useMemo, useRef, useState } from "react";
import { CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L, { type LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import type { ApiStop } from "../../services/transitApi";

type ShuttleMapData = {
  name: string;
  latitude: number | null;
  longitude: number | null;
  recordedAt: string | null;
};

type MoveMateMapProps = {
  shuttle: ShuttleMapData;
  stops: ApiStop[];
  showStudentLocation?: boolean;
  onStudentLocationChange?: (location: [number, number]) => void;
};

const campusCenter: LatLngExpression = [5.6508, -0.1869];

function createMarkerIcon(color: string, symbol: string) {
  return L.divIcon({
    className: "movemate-map-marker",
    html: `<span style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;border:3px solid white;border-radius:50%;background:${color};color:white;font-weight:700;box-shadow:0 2px 6px rgba(15,23,42,.35)">${symbol}</span>`,
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

const shuttleIcon = createMarkerIcon("#0f766e", "BUS");
const stopIcon = createMarkerIcon("#d97706", "•");

function MapInteractionTracker({ interacted }: { interacted: React.MutableRefObject<boolean> }) {
  useMapEvents({
    dragstart: () => { interacted.current = true; },
    zoomstart: () => { interacted.current = true; },
  });
  return null;
}

function FitMapToData({ shuttle, stops, fitKey }: { shuttle: ShuttleMapData; stops: ApiStop[]; fitKey: string }) {
  const map = useMap();
  const interacted = useRef(false);
  const fittedKey = useRef("");

  useEffect(() => {
    if (interacted.current || fittedKey.current === fitKey) return;

    const points: LatLngExpression[] = stops.map((stop) => [stop.latitude, stop.longitude]);
    if (shuttle.latitude !== null && shuttle.longitude !== null) points.push([shuttle.latitude, shuttle.longitude]);
    if (points.length === 0) return;

    fittedKey.current = fitKey;
    if (points.length === 1) {
      map.setView(points[0], 15);
    } else {
      map.fitBounds(L.latLngBounds(points), { padding: [28, 28], maxZoom: 16 });
    }
  }, [fitKey, map, shuttle.latitude, shuttle.longitude, stops]);

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

function MoveMateMap({ shuttle, stops, showStudentLocation = true, onStudentLocationChange }: MoveMateMapProps) {
  const [studentLocation, setStudentLocation] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState("");

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
  const shuttlePosition: [number, number] | null = shuttle.latitude !== null && shuttle.longitude !== null
    ? [shuttle.latitude, shuttle.longitude]
    : null;
  const distance = studentLocation && shuttlePosition ? distanceInKm(studentLocation, shuttlePosition) : null;
  const fitKey = `${shuttle.name}-${stops.map((stop) => stop.id).join(",")}`;

  return (
    <div className="relative h-full min-h-[23rem] w-full">
      <MapContainer className="h-full min-h-[23rem] w-full" center={campusCenter} zoom={14} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitMapToData shuttle={shuttle} stops={stops} fitKey={fitKey} />
        {routePath.length > 1 && <Polyline positions={routePath} pathOptions={{ color: "#0f766e", weight: 5, opacity: 0.8 }} />}
        {stops.map((stop) => (
          <Marker key={stop.id} position={[stop.latitude, stop.longitude]} icon={stopIcon}>
            <Popup>{stop.name}</Popup>
          </Marker>
        ))}
        {shuttlePosition && (
          <Marker position={shuttlePosition} icon={shuttleIcon}>
            <Popup><strong>{shuttle.name}</strong><br />{shuttle.recordedAt ? `Updated ${new Date(shuttle.recordedAt).toLocaleTimeString()}` : "GPS update received"}</Popup>
          </Marker>
        )}
        {showStudentLocation && studentLocation && <CircleMarker center={studentLocation} radius={8} pathOptions={{ color: "#1d4ed8", fillColor: "#60a5fa", fillOpacity: 1 }}><Popup>Your location</Popup></CircleMarker>}
      </MapContainer>
      <div className="pointer-events-none absolute left-3 top-3 z-[1000] max-w-[calc(100%-1.5rem)] rounded-md bg-white/95 px-3 py-2 text-xs font-semibold text-slate-700 shadow-md">
        <p>{shuttlePosition ? "Shuttle GPS active" : "Waiting for shuttle GPS"}</p>
        {showStudentLocation && distance !== null && <p className="mt-1 font-normal text-slate-600">You are {formatDistance(distance)}</p>}
        {showStudentLocation && locationError && <p className="mt-1 font-normal text-amber-700">{locationError}</p>}
      </div>
    </div>
  );
}

export default MoveMateMap;