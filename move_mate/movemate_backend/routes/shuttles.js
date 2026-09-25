const express = require("express");
const prisma = require("../database");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();
const reverseGeocodeCache = new Map();

async function reverseGeocode(latitude, longitude, shuttleId) {
  const cached = reverseGeocodeCache.get(shuttleId);
  if (cached && Date.now() - cached.updatedAt < 60000 && Math.hypot(cached.latitude - latitude, cached.longitude - longitude) < 0.001) {
    return cached.placeName;
  }

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, {
      headers: { "User-Agent": "MoveMate/1.0 campus shuttle tracker" },
    });
    if (!response.ok) return null;
    const result = await response.json();
    const address = result.address || {};
    const placeName = address.road || address.neighbourhood || address.suburb || address.city_district || result.display_name || null;
    if (placeName) reverseGeocodeCache.set(shuttleId, { latitude, longitude, placeName, updatedAt: Date.now() });
    return placeName;
  } catch {
    return null;
  }
}

async function serializeShuttle(shuttle) {
  const location = shuttle.locations?.[0];
  const locationIsFresh = location?.recordedAt && Date.now() - new Date(location.recordedAt).getTime() <= 120000;
  const hasLocation = !!location && location.latitude !== null && location.longitude !== null;
  const placeName = location?.placeName || (hasLocation ? await reverseGeocode(location.latitude, location.longitude, shuttle.id) : null);
  return {
    id: shuttle.id,
    name: shuttle.name,
    plate_number: shuttle.plateNumber,
    status: shuttle.status === "maintenance" ? "maintenance" : locationIsFresh ? "active" : "inactive",
    configured_status: shuttle.status,
    current_route_id: shuttle.currentRouteId,
    route_name: shuttle.currentRoute?.name || null,
    driver_id: shuttle.driverId,
    driver_name: shuttle.driver?.name || null,
    driver_email: shuttle.driver?.email || null,
    driver_phone: shuttle.driverPhone,
    latitude: location?.latitude ?? null,
    longitude: location?.longitude ?? null,
    place_name: placeName,
    speed_kmh: location?.speedKmh || null,
    recorded_at: location?.recordedAt || null,
    updated_at: shuttle.updatedAt,
  };
}

/**
 * @swagger
 * /api/shuttles:
 *   get:
 *     tags: [Shuttles]
 *     summary: List shuttles with their latest locations
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Shuttle list }
 */
router.get("/", protect, async (req, res) => {
  try {
    const shuttles = await prisma.shuttle.findMany({
      orderBy: { id: "asc" },
      include: {
        currentRoute: { select: { name: true } },
        driver: { select: { id: true, name: true, email: true } },
        locations: { orderBy: { recordedAt: "desc" }, take: 1 },
      },
    });

    res.json({ shuttles: await Promise.all(shuttles.map(serializeShuttle)) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load shuttles." });
  }
});

/**
 * @swagger
 * /api/shuttles/assigned/me:
 *   get:
 *     tags: [Driver GPS]
 *     summary: Get the shuttle assigned to the authenticated driver
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Assigned shuttle }
 *       403: { description: Driver access required }
 *       404: { description: No shuttle assignment }
 */
router.get("/assigned/me", protect, authorize("driver"), async (req, res) => {
  const shuttle = await prisma.shuttle.findFirst({
    where: { driverId: Number(req.user.id) },
    include: {
      currentRoute: { select: { id: true, name: true } },
      driver: { select: { id: true, name: true, email: true } },
      locations: { orderBy: { recordedAt: "desc" }, take: 1 },
    },
  });
  if (!shuttle) return res.status(404).json({ message: "No shuttle is assigned to this driver." });
  const serialized = await serializeShuttle(shuttle);
  res.json({ shuttle: { ...serialized, route_id: shuttle.currentRoute?.id || null } });
});

/**
 * @swagger
 * /api/shuttles/{id}/assignment:
 *   patch:
 *     tags: [Admin]
 *     summary: Assign a driver and phone number to a shuttle
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [driver_id, driver_phone]
 *             properties:
 *               driver_id: { type: integer, example: 2 }
 *               driver_phone: { type: string, example: "0240000000" }
 *     responses:
 *       200: { description: Assignment updated }
 *       400: { description: Invalid driver assignment }
 *       403: { description: Admin access required }
 */
router.patch("/:id/assignment", protect, authorize("admin"), async (req, res) => {
  try {
    const driverId = Number(req.body.driver_id);
    const driverPhone = String(req.body.driver_phone || "").trim();
    if (!Number.isInteger(driverId) || !driverPhone) return res.status(400).json({ message: "driver_id and driver_phone are required." });

    const driver = await prisma.user.findUnique({ where: { id: driverId } });
    if (!driver || driver.role !== "driver") return res.status(400).json({ message: "The selected user is not a driver." });

    const shuttle = await prisma.shuttle.update({
      where: { id: Number(req.params.id) },
      data: { driverId, driverPhone },
      include: { currentRoute: { select: { name: true } }, driver: { select: { id: true, name: true, email: true } }, locations: { orderBy: { recordedAt: "desc" }, take: 1 } },
    });
    res.json({ shuttle: await serializeShuttle(shuttle) });
  } catch (error) {
    if (error.code === "P2002") return res.status(409).json({ message: "That driver is already assigned to another shuttle." });
    if (error.code === "P2025") return res.status(404).json({ message: "Shuttle not found." });
    console.error(error);
    res.status(500).json({ message: "Could not assign driver." });
  }
});

/**
 * @swagger
 * /api/shuttles/{id}:
 *   get:
 *     tags: [Shuttles]
 *     summary: Get a shuttle and its latest location
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Shuttle details }
 *       404: { description: Shuttle not found }
 */
router.get("/:id", protect, async (req, res) => {
  try {
    const shuttle = await prisma.shuttle.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        currentRoute: { select: { id: true, name: true } },
        driver: { select: { id: true, name: true, email: true } },
        locations: { orderBy: { recordedAt: "desc" }, take: 1 },
      },
    });

    if (!shuttle) {
      return res.status(404).json({ message: "Shuttle not found." });
    }

    const serialized = await serializeShuttle(shuttle);
    serialized.route_id = shuttle.currentRoute?.id || null;
    res.json({ shuttle: serialized });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load shuttle." });
  }
});

/**
 * @swagger
 * /api/shuttles/{id}/eta:
 *   get:
 *     tags: [Student Tracking]
 *     summary: Get a simple ETA to the nearest route stop
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Estimated arrival information }
 *       404: { description: Shuttle or GPS location not found }
 */
router.get("/:id/eta", protect, async (req, res) => {
  const shuttle = await prisma.shuttle.findUnique({
    where: { id: Number(req.params.id) },
    include: { locations: { orderBy: { recordedAt: "desc" }, take: 1 }, currentRoute: { include: { stops: { orderBy: { stopOrder: "asc" }, include: { stop: true } } } } },
  });
  const location = shuttle?.locations?.[0];
  if (!shuttle || !location) return res.status(404).json({ message: "Shuttle GPS location is not available." });
  const stops = shuttle.currentRoute?.stops || [];
  if (!stops.length) return res.json({ shuttle_id: shuttle.id, next_stop: null, estimated_minutes: null, message: "No route stops are configured." });
  const toRadians = (value) => value * Math.PI / 180;
  const distanceKm = (stop) => {
    const lat = toRadians(stop.stop.latitude - location.latitude);
    const lon = toRadians(stop.stop.longitude - location.longitude);
    const a = Math.sin(lat / 2) ** 2 + Math.cos(toRadians(location.latitude)) * Math.cos(toRadians(stop.stop.latitude)) * Math.sin(lon / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };
  const nextStop = stops.reduce((closest, item) => !closest || distanceKm(item) < closest.distance ? { item, distance: distanceKm(item) } : closest, null);
  const speed = Number(location.speedKmh) > 2 ? Number(location.speedKmh) : 20;
  res.json({ shuttle_id: shuttle.id, next_stop: { id: nextStop.item.stop.id, name: nextStop.item.stop.name, latitude: nextStop.item.stop.latitude, longitude: nextStop.item.stop.longitude }, distance_km: Number(nextStop.distance.toFixed(2)), estimated_minutes: Math.max(1, Math.ceil((nextStop.distance / speed) * 60)), speed_kmh: speed });
});

/**
 * @swagger
 * /api/shuttles:
 *   post:
 *     tags: [Shuttles]
 *     summary: Create a shuttle
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               plate_number: { type: string }
 *               status: { type: string, enum: [active, inactive, maintenance] }
 *               current_route_id: { type: integer, nullable: true }
 *     responses:
 *       201: { description: Shuttle created }
 */
router.post("/", protect, authorize("admin", "representative"), async (req, res) => {
  try {
    const { name, plate_number, status = "active", current_route_id = null } = req.body;

    if (!name) return res.status(400).json({ message: "Shuttle name is required." });

    const shuttle = await prisma.shuttle.create({
      data: {
        name,
        plateNumber: plate_number || null,
        status,
        currentRouteId: current_route_id === null ? null : Number(current_route_id),
      },
    });

    res.status(201).json({ shuttle: shuttle });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not create shuttle." });
  }
});

/**
 * @swagger
 * /api/shuttles/{id}:
 *   delete:
 *     tags: [Shuttles]
 *     summary: Remove a shuttle
 *     description: Removes the shuttle and its related location and trip records. Admin only.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Shuttle removed }
 *       403: { description: Admin access required }
 *       404: { description: Shuttle not found }
 */
router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const shuttle = await prisma.shuttle.findUnique({ where: { id: Number(req.params.id) } });
    if (!shuttle) {
      return res.status(404).json({ message: "Shuttle not found." });
    }

    await prisma.shuttle.delete({ where: { id: shuttle.id } });
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Could not remove shuttle." });
  }
});

/**
 * @swagger
 * /api/shuttles/{id}/status:
 *   patch:
 *     tags: [Shuttles]
 *     summary: Update shuttle status
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [active, inactive, maintenance] }
 *     responses:
 *       200: { description: Status updated }
 *       404: { description: Shuttle not found }
 */
router.patch("/:id/status", protect, authorize("driver", "representative", "admin"), async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["active", "inactive", "maintenance"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid shuttle status." });
    }

    const shuttle = await prisma.shuttle.findUnique({ where: { id: Number(req.params.id) } });
    if (!shuttle) {
      return res.status(404).json({ message: "Shuttle not found." });
    }

    const updatedShuttle = await prisma.shuttle.update({
      where: { id: shuttle.id },
      data: { status },
    });

    res.json({ shuttle: updatedShuttle });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not update shuttle status." });
  }
});

module.exports = router;
