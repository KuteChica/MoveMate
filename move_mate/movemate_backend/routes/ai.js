const express = require("express");
const prisma = require("../database");
const config = require("../config");
const { protect } = require("../middleware/auth");

const router = express.Router();
const reverseGeocodeCache = new Map();

function sanitizeMessage(message) {
  return String(message || "").trim();
}

function normalizeStudentLocation(location) {
  if (!location || typeof location !== "object") return null;
  const latitude = Number(location.latitude);
  const longitude = Number(location.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;

  return { latitude, longitude };
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function calculateDistanceKm(first, second) {
  if (!first || !second) return null;
  const earthRadiusKm = 6371;
  const latitudeDelta = toRadians(second.latitude - first.latitude);
  const longitudeDelta = toRadians(second.longitude - first.longitude);
  const firstLatitude = toRadians(first.latitude);
  const secondLatitude = toRadians(second.latitude);
  const a = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(firstLatitude) * Math.cos(secondLatitude) * Math.sin(longitudeDelta / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistanceKm(distanceKm) {
  if (distanceKm === null || Number.isNaN(distanceKm)) return "an unknown distance";
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} meters`;
  return `${distanceKm.toFixed(1)} km`;
}

async function resolvePlaceNameFromGps(latitude, longitude, shuttleId) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  const cacheKey = `${shuttleId}:${latitude.toFixed(5)}:${longitude.toFixed(5)}`;
  if (reverseGeocodeCache.has(cacheKey)) {
    return reverseGeocodeCache.get(cacheKey);
  }

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, {
      headers: { "User-Agent": "MoveMate/1.0 campus shuttle tracker" },
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    const address = result?.address || {};
    const placeName = address.road || address.neighbourhood || address.suburb || address.city_district || result?.display_name || null;

    if (placeName) {
      reverseGeocodeCache.set(cacheKey, placeName);
    }

    return placeName;
  } catch {
    return null;
  }
}

function getShuttleStatus(shuttle) {
  if (!shuttle) return "inactive";
  if (shuttle.status === "maintenance") return "maintenance";

  const recordedAt = shuttle.recordedAt || shuttle.recorded_at || null;
  if (recordedAt) {
    const ageMinutes = (Date.now() - new Date(recordedAt).getTime()) / 60000;
    if (ageMinutes <= 2) return "active";
  }

  return shuttle.status === "active" ? "active" : "inactive";
}

function getActiveShuttles(shuttles) {
  return (shuttles || []).filter((shuttle) => getShuttleStatus(shuttle) === "active" && Number.isFinite(shuttle.latitude) && Number.isFinite(shuttle.longitude));
}

function getNearestShuttle(shuttles, studentLocation) {
  const normalizedStudentLocation = normalizeStudentLocation(studentLocation);
  const activeShuttles = getActiveShuttles(shuttles);

  if (!normalizedStudentLocation || !activeShuttles.length) {
    return null;
  }

  return activeShuttles.reduce((closest, shuttle) => {
    const distance = calculateDistanceKm(normalizedStudentLocation, { latitude: shuttle.latitude, longitude: shuttle.longitude });
    if (!closest) {
      return { shuttle, distance };
    }
    return distance < closest.distance ? { shuttle, distance } : closest;
  }, null)?.shuttle || null;
}

function findShuttleByName(message, shuttles) {
  const normalizedMessage = String(message || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ");

  return shuttles.find((shuttle) => {
    if (!shuttle?.name) return false;
    const shuttleName = shuttle.name.toLowerCase();
    return normalizedMessage.includes(shuttleName) || normalizedMessage.includes(shuttleName.replace(/\s+/g, ""));
  }) || null;
}

function formatDriverInfo(shuttle) {
  if (!shuttle) return "Driver information is currently unavailable.";
  if (!shuttle.driverName && !shuttle.driverPhone) return "Driver information is currently unavailable.";

  if (shuttle.driverName && shuttle.driverPhone) {
    return `${shuttle.driverName} is assigned to ${shuttle.name} and can be contacted on ${shuttle.driverPhone}.`;
  }

  if (shuttle.driverName) {
    return `${shuttle.driverName} is assigned to ${shuttle.name}.`;
  }

  return `${shuttle.name} has a saved driver phone number on file, but the driver name is not available.`;
}

function formatLiveLocationReply(shuttle) {
  if (!shuttle) return "No shuttle data is currently available.";
  if (shuttle.placeName) return `${shuttle.name} is currently at ${shuttle.placeName}.`;
  return `${shuttle.name} is currently on the move.`;
}

function buildSnapshot() {
  return Promise.all([
    prisma.shuttle.findMany({
      orderBy: { id: "asc" },
      include: {
        driver: { select: { id: true, name: true, email: true } },
        locations: { orderBy: { recordedAt: "desc" }, take: 1 },
      },
    }),
    prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
  ]).then(async ([shuttles, notifications]) => {
    const resolvedShuttles = await Promise.all(shuttles.map(async (shuttle) => {
      const latestLocation = shuttle.locations?.[0];
      const resolvedPlaceName = latestLocation?.placeName || (latestLocation ? await resolvePlaceNameFromGps(latestLocation.latitude, latestLocation.longitude, shuttle.id) : null);
      const status = getShuttleStatus({ status: shuttle.status, recordedAt: latestLocation?.recordedAt || null });

      return {
        id: shuttle.id,
        name: shuttle.name,
        status,
        configuredStatus: shuttle.status,
        latitude: latestLocation?.latitude ?? null,
        longitude: latestLocation?.longitude ?? null,
        placeName: resolvedPlaceName || null,
        recordedAt: latestLocation?.recordedAt || null,
        driverId: shuttle.driverId,
        driverName: shuttle.driver?.name || null,
        driverEmail: shuttle.driver?.email || null,
        driverPhone: shuttle.driverPhone || null,
      };
    }));

    return {
      shuttles: resolvedShuttles,
      notifications: notifications.map((notification) => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        createdAt: notification.createdAt,
      })),
    };
  });
}

function buildFallbackResponse(message, snapshot, studentLocation = null) {
  const lower = String(message || "").toLowerCase();
  const shuttles = snapshot?.shuttles || [];
  const notifications = snapshot?.notifications || [];
  const activeShuttles = getActiveShuttles(shuttles);
  const namedShuttle = findShuttleByName(message, shuttles);
  const normalizedStudentLocation = normalizeStudentLocation(studentLocation);

  if ((lower.includes("how do i use move mate") || lower.includes("how do i use movemate") || lower.includes("how does move mate work") || lower.includes("how does movemate work"))) {
    return "MoveMate helps students track live shuttle movement in real time. You can open the shuttle tracker, see active shuttles on the map, and ask the assistant for current shuttle status or location updates.";
  }

  if ((lower.includes("notification") || lower.includes("update") || lower.includes("alert")) && notifications.length) {
    const latest = notifications.slice(0, 3);
    return `Recent MoveMate updates: ${latest.map((notification) => `${notification.title}: ${notification.message}`).join("; ")}.`;
  }

  if ((lower.includes("where is") || lower.includes("where's")) && lower.includes("my shuttle")) {
    if (namedShuttle) return formatLiveLocationReply(namedShuttle);
    if (activeShuttles.length === 1) return formatLiveLocationReply(activeShuttles[0]);
    return "I can help with that, but I need the shuttle name or a clear match from the currently active shuttles.";
  }

  if (lower.includes("which shuttle is closest to me") || lower.includes("nearest shuttle") || lower.includes("closest shuttle") || lower.includes("nearest active shuttle")) {
    if (!normalizedStudentLocation) {
      return "I can find the nearest active shuttle, but I need your current location permission first.";
    }
    if (!activeShuttles.length) {
      return "There are no active shuttles currently reported in MoveMate.";
    }

    const nearest = getNearestShuttle(activeShuttles, normalizedStudentLocation);
    if (!nearest) {
      return "I could not determine a nearest live shuttle from the current MoveMate data.";
    }

    const nearestDistance = calculateDistanceKm(normalizedStudentLocation, { latitude: nearest.latitude, longitude: nearest.longitude });
    return `${nearest.name} is the closest active shuttle to you. ${nearest.placeName ? `It is currently at ${nearest.placeName}.` : "It is currently on the move."} It is about ${formatDistanceKm(nearestDistance)} away.`;
  }

  if (lower.includes("how far") || lower.includes("distance") || lower.includes("from me")) {
    const targetShuttle = namedShuttle || getNearestShuttle(activeShuttles, normalizedStudentLocation);
    if (!normalizedStudentLocation) {
      return "I can calculate the distance from your location, but I need your current location permission first.";
    }
    if (!targetShuttle) {
      return "There are no active shuttles currently reported in MoveMate to compare against your location.";
    }

    const distanceKm = calculateDistanceKm(normalizedStudentLocation, { latitude: targetShuttle.latitude, longitude: targetShuttle.longitude });
    return `${targetShuttle.name} is about ${formatDistanceKm(distanceKm)} away from your current location.`;
  }

  if (lower.includes("which shuttles are currently active") || lower.includes("what shuttles are active") || lower.includes("are there any shuttles running") || lower.includes("active shuttles")) {
    if (!activeShuttles.length) {
      return "There are no active shuttles currently reported in MoveMate.";
    }
    return `The active shuttles currently reported in MoveMate are: ${activeShuttles.map((shuttle) => shuttle.name).join(", ")}.`;
  }

  if (lower.includes("status") && (lower.includes("bani") || namedShuttle)) {
    const statusTarget = namedShuttle || shuttles.find((shuttle) => shuttle.name.toLowerCase() === "bani");
    if (!statusTarget) {
      return "I could not find that shuttle in the current MoveMate records.";
    }
    const status = getShuttleStatus(statusTarget);
    if (status === "active") {
      return `${statusTarget.name} is currently active${statusTarget.placeName ? ` and last reported near ${statusTarget.placeName}` : "."}`;
    }
    if (status === "maintenance") {
      return `${statusTarget.name} is currently under maintenance.`;
    }
    return `${statusTarget.name} is currently inactive.`;
  }

  if ((lower.includes("who is driving") || lower.includes("driver")) && namedShuttle) {
    return formatDriverInfo(namedShuttle);
  }

  if (namedShuttle && (lower.includes("where") || lower.includes("location") || lower.includes("right now"))) {
    if (namedShuttle.latitude !== null && namedShuttle.longitude !== null) {
      return formatLiveLocationReply(namedShuttle);
    }
    return `${namedShuttle.name} currently has no live location reported in MoveMate.`;
  }

  if (namedShuttle && lower.includes("status")) {
    const status = getShuttleStatus(namedShuttle);
    return `${namedShuttle.name} is currently ${status}.`;
  }

  if (lower.includes("where is") || lower.includes("where's") || lower.includes("location")) {
    const targetShuttle = namedShuttle || (activeShuttles.length === 1 ? activeShuttles[0] : null);
    if (!targetShuttle) {
      return "I could not find a matching shuttle in the current MoveMate records.";
    }
    return formatLiveLocationReply(targetShuttle);
  }

  if (lower.includes("active") && lower.includes("shuttle")) {
    if (!activeShuttles.length) {
      return "There are no active shuttles currently reported in MoveMate.";
    }
    return `The active shuttles currently reported are: ${activeShuttles.map((shuttle) => shuttle.name).join(", ")}.`;
  }

  if (lower.includes("nearest") || lower.includes("closest")) {
    if (!normalizedStudentLocation) {
      return "I can determine the nearest active shuttle, but I need your current location permission first.";
    }
    if (!activeShuttles.length) {
      return "There are no active shuttles currently reported in MoveMate.";
    }

    const nearest = getNearestShuttle(activeShuttles, normalizedStudentLocation);
    if (!nearest) {
      return "I could not determine the nearest shuttle from the current MoveMate data.";
    }
    return `${nearest.name} is the closest active shuttle to you.`;
  }

  if (lower.includes("how does move mate work") || lower.includes("what is movemate")) {
    return "MoveMate is a live campus shuttle tracker. It lets students view active shuttles, see their current location, and check live status information from the backend system.";
  }

  const summary = shuttles.length ? shuttles.map((shuttle) => shuttle.name).join(", ") : "No shuttle names are currently available";
  return `I can answer questions using the current MoveMate shuttle data. Right now, the available shuttle records are: ${summary}.`;
}

async function callExternalAi(message, snapshot, studentLocation = null) {
  const apiKey = config.ai.apiKey;
  const baseUrl = config.ai.apiBaseUrl;
  const model = config.ai.model;

  if (!apiKey) {
    return {
      success: true,
      source: "mock",
      message: buildFallbackResponse(message, snapshot, studentLocation),
    };
  }

  const systemPrompt = "You are MoveMate AI. Use only the live MoveMate shuttle data supplied in the request. Do not invent shuttle names, GPS coordinates, driver names, phone numbers, ETA values, routes, or stops. If student location is provided, use it to answer nearest or distance questions. If the data is unavailable, say so clearly. Keep answers brief and student-friendly.";

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Student question: ${message}\n\nStudent location: ${studentLocation ? JSON.stringify(studentLocation) : "not provided"}\n\nMoveMate live shuttle data:\n${JSON.stringify(snapshot, null, 2)}`,
        },
      ],
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error?.message || "The AI service is unavailable right now.");
  }

  const completionText = payload?.choices?.[0]?.message?.content;
  if (!completionText) {
    throw new Error("The AI service returned an empty response.");
  }

  return {
    success: true,
    source: "ai",
    message: completionText.trim(),
  };
}

router.post("/chat", protect, async (req, res) => {
  try {
    const message = sanitizeMessage(req.body?.message);
    const studentLocation = normalizeStudentLocation(req.body?.studentLocation);

    if (!message) {
      return res.status(400).json({ success: false, message: "A message is required." });
    }

    const snapshot = await buildSnapshot();

    try {
      const aiResponse = await callExternalAi(message, snapshot, studentLocation);
      return res.json(aiResponse);
    } catch (error) {
      const fallbackResponse = buildFallbackResponse(message, snapshot, studentLocation);
      return res.json({
        success: true,
        source: "mock",
        message: fallbackResponse,
      });
    }
  } catch (error) {
    console.error("AI chat error:", error);
    res.status(500).json({ success: false, message: "The AI assistant could not process the request." });
  }
});

module.exports = router;
module.exports.getShuttleStatus = getShuttleStatus;
module.exports.getActiveShuttles = getActiveShuttles;
module.exports.getNearestShuttle = getNearestShuttle;
module.exports.buildFallbackResponse = buildFallbackResponse;
