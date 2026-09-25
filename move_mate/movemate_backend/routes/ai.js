const express = require("express");
const prisma = require("../database");
const config = require("../config");
const { protect } = require("../middleware/auth");

const router = express.Router();

function sanitizeMessage(message) {
  return String(message || "").trim();
}

function listActiveShuttles(shuttles) {
  const active = shuttles.filter((shuttle) => shuttle.status === "active" && shuttle.locations?.[0]);
  return active.length ? active.map((shuttle) => ({
    name: shuttle.name,
    route: shuttle.currentRoute?.name || "No route assigned",
    status: shuttle.status,
    location: shuttle.locations?.[0]?.placeName || "Location not available",
  })) : [];
}

function getShuttleStatus(shuttle) {
  if (!shuttle) return "inactive";
  if (shuttle.status === "maintenance") return "maintenance";
  if (!shuttle.recordedAt) return "inactive";
  const ageMinutes = (Date.now() - new Date(shuttle.recordedAt).getTime()) / 60000;
  return ageMinutes <= 2 ? "active" : "inactive";
}

function buildSnapshot() {
  return Promise.all([
    prisma.shuttle.findMany({
      orderBy: { id: "asc" },
      include: {
        currentRoute: { select: { id: true, name: true, startLocation: true, endLocation: true } },
        locations: { orderBy: { recordedAt: "desc" }, take: 1 },
      },
    }),
    prisma.shuttleRoute.findMany({
      orderBy: { id: "asc" },
      include: {
        stops: { orderBy: { stopOrder: "asc" }, include: { stop: true } },
      },
    }),
  ]).then(([shuttles, routes]) => ({
    shuttles: shuttles.map((shuttle) => ({
      id: shuttle.id,
      name: shuttle.name,
      status: shuttle.status,
      currentRouteId: shuttle.currentRouteId,
      routeName: shuttle.currentRoute?.name || null,
      routeStart: shuttle.currentRoute?.startLocation || null,
      routeEnd: shuttle.currentRoute?.endLocation || null,
      latitude: shuttle.locations?.[0]?.latitude ?? null,
      longitude: shuttle.locations?.[0]?.longitude ?? null,
      placeName: shuttle.locations?.[0]?.placeName || null,
      recordedAt: shuttle.locations?.[0]?.recordedAt || null,
      driverName: shuttle.driver?.name || null,
      driverPhone: shuttle.driverPhone || null,
    })),
    routes: routes.map((route) => ({
      id: route.id,
      name: route.name,
      description: route.description || null,
      startLocation: route.startLocation || null,
      endLocation: route.endLocation || null,
      active: route.active,
      stops: route.stops.map(({ stop, stopOrder }) => ({
        stopOrder,
        id: stop.id,
        name: stop.name,
        latitude: stop.latitude,
        longitude: stop.longitude,
      })),
    })),
  }));
}

function buildFallbackResponse(message, snapshot) {
  const lower = message.toLowerCase();
  const routes = snapshot.routes || [];
  const shuttles = snapshot.shuttles || [];
  const activeShuttles = shuttles.filter((shuttle) => getShuttleStatus(shuttle) === "active");

  const bani = shuttles.find((shuttle) => shuttle.name && shuttle.name.toLowerCase() === "bani");
  if (lower.includes("bani") && lower.includes("status")) {
    if (!bani) return "Bani shuttle is not currently available in the MoveMate records.";
    const status = getShuttleStatus(bani);
    if (status === "active") {
      return `Bani shuttle is currently active${bani.placeName ? ` and last reported near ${bani.placeName}` : ""}.`;
    }
    if (status === "maintenance") {
      return "Bani shuttle is currently under maintenance.";
    }
    return "Bani shuttle is currently inactive because it is not reporting live tracking right now.";
  }

  if (lower.includes("bani") && (lower.includes("minutes") || lower.includes("eta") || lower.includes("arrive") || lower.includes("how long"))) {
    if (!bani) return "I could not find Bani shuttle in the current MoveMate records.";
    if (!bani.placeName && (!bani.latitude || !bani.longitude)) {
      return "Bani shuttle is currently not reporting a live GPS update, so I cannot estimate its arrival time right now.";
    }
    const status = getShuttleStatus(bani);
    if (status !== "active") {
      return `Bani shuttle is currently ${status}. I cannot give a reliable arrival time until it is actively tracking.`;
    }
    return `Bani shuttle is currently ${status}${bani.placeName ? ` near ${bani.placeName}` : ""}. I can estimate its arrival to your current location once you share your exact location.`;
  }

  if (lower.includes("route") && (lower.includes("available") || lower.includes("what routes") || lower.includes("routes are"))) {
    if (!routes.length) {
      return "There are currently no route records available in MoveMate.";
    }
    return `Available routes in MoveMate: ${routes.map((route) => route.name).join(", ")}.`;
  }

  if (lower.includes("stop") && (lower.includes("available") || lower.includes("what stops") || lower.includes("stops are"))) {
    if (!routes.length) {
      return "No stop information is currently available in MoveMate.";
    }
    const stopNames = [...new Set(routes.flatMap((route) => route.stops.map((stop) => stop.name)))];
    if (!stopNames.length) {
      return "No route stop information is currently available in MoveMate.";
    }
    return `Available stops in MoveMate: ${stopNames.join(", ")}.`;
  }

  if (lower.includes("active") && lower.includes("shuttle")) {
    if (!activeShuttles.length) {
      return "There are no active shuttles currently reported in MoveMate.";
    }
    return `The active shuttles currently reported are: ${activeShuttles.map((shuttle) => shuttle.name).join(", ")}.`;
  }

  if (lower.includes("where") && lower.includes("shuttle")) {
    const match = shuttles.find((shuttle) => lower.includes(shuttle.name.toLowerCase()));
    if (!match) {
      return "I could not find a matching shuttle in the current MoveMate records.";
    }
    if (!match.latitude || !match.longitude || !match.placeName) {
      return `${match.name} is present in MoveMate, but its live GPS location is currently unavailable.`;
    }
    return `${match.name} was last reported near ${match.placeName}.`;
  }

  if (lower.includes("nearest")) {
    if (!activeShuttles.length) {
      return "I cannot determine the nearest active shuttle without your current location, and there are no active shuttles currently reported.";
    }
    return "I cannot determine the nearest active shuttle without your current location. The active shuttles currently reported are: " + activeShuttles.map((shuttle) => shuttle.name).join(", ") + ".";
  }

  if (lower.includes("going")) {
    const match = shuttles.find((shuttle) => lower.includes(shuttle.name.toLowerCase()));
    if (!match) {
      return "I could not match your question to a shuttle in the current MoveMate records.";
    }
    if (!match.routeName) {
      return `${match.name} has no assigned route in MoveMate right now.`;
    }
    return `${match.name} is assigned to ${match.routeName}.`;
  }

  if (lower.includes("what shuttle information") || lower.includes("shuttle information")) {
    const summary = shuttles.length ? shuttles.map((shuttle) => `${shuttle.name} (${shuttle.status})`).join(", ") : "No shuttle data available";
    return `MoveMate currently has the following shuttle information: ${summary}.`;
  }

  if (lower.includes("main campus route") || lower.includes("route") || lower.includes("stops on")) {
    const route = routes.find((item) => lower.includes(item.name.toLowerCase()));
    if (!route) {
      return "I could not find that route in the current MoveMate data.";
    }
    if (!route.stops.length) {
      return `The ${route.name} route is available, but there are no stop records for it in MoveMate yet.`;
    }
    return `${route.name} includes these stops: ${route.stops.map((stop) => stop.name).join(", ")}.`;
  }

  const summary = shuttles.length ? shuttles.map((shuttle) => shuttle.name).join(", ") : "No shuttle names are currently available";
  return `I can answer questions using the current MoveMate data. At the moment, the available shuttle records are: ${summary}.`;
}

async function callExternalAi(message, snapshot) {
  const apiKey = config.ai.apiKey;
  const baseUrl = config.ai.apiBaseUrl;
  const model = config.ai.model;

  if (!apiKey) {
    return {
      success: true,
      source: "mock",
      message: buildFallbackResponse(message, snapshot),
    };
  }

  const systemPrompt = `You are MoveMate AI. Answer only using the supplied MoveMate data. Never invent shuttles, routes, stops, driver names, phone numbers, coordinates, or ETA values. If the answer cannot be determined from the supplied data, say that the information is currently unavailable. Keep the answer brief and student-friendly.`;

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
          content: `Student question: ${message}\n\nMoveMate data:\n${JSON.stringify(snapshot, null, 2)}`,
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

    if (!message) {
      return res.status(400).json({ success: false, message: "A message is required." });
    }

    const snapshot = await buildSnapshot();

    try {
      const aiResponse = await callExternalAi(message, snapshot);
      return res.json(aiResponse);
    } catch (error) {
      const fallbackResponse = buildFallbackResponse(message, snapshot);
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
