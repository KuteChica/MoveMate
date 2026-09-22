const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
const tokenStorageKey = "movemate-auth-token";

export type ApiShuttle = {
  id: number;
  name: string;
  plate_number: string | null;
  status: string;
  current_route_id: number | null;
  route_name: string | null;
  latitude: number | null;
  longitude: number | null;
  place_name: string | null;
  recorded_at: string | null;
  speed_kmh?: number | null;
  driver_id?: number | null;
  driver_name?: string | null;
  driver_email?: string | null;
  driver_phone?: string | null;
  configured_status?: string;
};

export type ApiDriver = { id: number; name: string; email: string; role: string };
export type ApiEta = { shuttle_id: number; next_stop: { id: number; name: string; latitude: number; longitude: number } | null; distance_km?: number; estimated_minutes: number | null; speed_kmh?: number };

export type ApiRoute = {
  id: number;
  name: string;
  description: string | null;
  start_location: string | null;
  end_location: string | null;
  active: boolean;
};

export type ApiStop = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  stop_order: number;
};

export type ApiNotification = {
  id: number;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(tokenStorageKey);
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.message || "The request could not be completed.");
  }

  return body as T;
}

export async function getShuttles() {
  const response = await request<{ shuttles: ApiShuttle[] }>("/api/shuttles");
  return response.shuttles;
}

export async function getDrivers() {
  const response = await request<{ drivers: ApiDriver[] }>("/api/users/drivers");
  return response.drivers;
}

export async function createDriver(input: { name: string; email: string; password: string }) {
  const response = await request<{ user: ApiDriver }>("/api/users/admin/create", {
    method: "POST",
    body: JSON.stringify({ ...input, role: "driver" }),
  });
  return response.user;
}

export async function assignDriver(shuttleId: number, input: { driver_id: number; driver_phone: string }) {
  const response = await request<{ shuttle: ApiShuttle }>(`/api/shuttles/${shuttleId}/assignment`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return response.shuttle;
}

export async function getAssignedShuttle() {
  const response = await request<{ shuttle: ApiShuttle }>("/api/shuttles/assigned/me");
  return response.shuttle;
}

export async function sendDriverLocation(input: { latitude: number; longitude: number; accuracy: number; timestamp: string }) {
  const response = await request<{ location: { recorded_at: string } }>("/api/locations", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.location;
}

export async function getShuttleEta(shuttleId: number) {
  return request<ApiEta>(`/api/shuttles/${shuttleId}/eta`);
}

export async function getRoutes() {
  const response = await request<{ routes: ApiRoute[] }>("/api/routes");
  return response.routes;
}

export async function getRouteStops(routeId: number) {
  const response = await request<{ stops: ApiStop[] }>(`/api/routes/${routeId}/stops`);
  return response.stops;
}

export async function createShuttle(input: {
  name: string;
  plate_number?: string;
  status: string;
  current_route_id?: number | null;
}) {
  const response = await request<{ shuttle: ApiShuttle }>("/api/shuttles", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.shuttle;
}

export async function updateShuttleStatus(id: number, status: string) {
  const response = await request<{ shuttle: ApiShuttle }>(`/api/shuttles/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return response.shuttle;
}

export async function deleteShuttle(id: number) {
  await request<void>(`/api/shuttles/${id}`, { method: "DELETE" });
}

export async function createRoute(input: {
  name: string;
  description?: string;
  start_location?: string;
  end_location?: string;
}) {
  const response = await request<{ route: ApiRoute }>("/api/routes", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.route;
}

export async function updateProfile(input: { name?: string; email?: string }) {
  const response = await request<{ user: { id: number; name: string; email: string; role: string; created_at?: string } }>("/api/users/me", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return response.user;
}

export async function getNotifications() {
  const response = await request<{ notifications: ApiNotification[] }>("/api/notifications");
  return response.notifications;
}

export async function addRouteStop(routeId: number, input: { name: string; latitude: number; longitude: number; stop_order: number }) {
  const response = await request<{ stop: ApiStop }>(`/api/routes/${routeId}/stops`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.stop;
}

export async function getLocationHistory(shuttleId: number) {
  const response = await request<{ locations: Array<{ id: number; latitude: number; longitude: number; place_name: string | null; speed_kmh: number | null; recorded_at: string }> }>(`/api/locations/${shuttleId}/history`);
  return response.locations;
}

export async function submitFeedback(input: { name: string; email: string; subject: string; message: string }) {
  return request<{ message: string }>("/api/feedback", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
