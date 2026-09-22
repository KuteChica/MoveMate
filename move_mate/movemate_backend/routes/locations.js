const express = require("express");
const prisma = require("../database");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

/**
 * @swagger
 * /api/locations:
 *   post:
 *     tags: [Locations]
 *     summary: Record the authenticated driver's GPS location for their assigned shuttle
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [latitude, longitude]
 *             properties:
 *               latitude: { type: number, format: double, minimum: -90, maximum: 90 }
 *               longitude: { type: number, format: double, minimum: -180, maximum: 180 }
 *               accuracy: { type: number, format: double, example: 12.5 }
 *               timestamp: { type: string, format: date-time }
 *               place_name: { type: string }
 *               speed_kmh: { type: number, format: double }
 *     responses:
 *       201: { description: Location recorded }
 *       400: { description: Invalid coordinates }
 *       404: { description: Shuttle not found }
 */
router.post("/", protect, authorize("driver"), async (req, res) => {
  try {
    const { latitude, longitude, accuracy = null, timestamp = null, place_name = null, speed_kmh = null } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        message: "latitude and longitude are required."
      });
    }

    const lat = Number(latitude);
    const lon = Number(longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res.status(400).json({ message: "Invalid GPS coordinates." });
    }

    const shuttle = await prisma.shuttle.findFirst({ where: { driverId: Number(req.user.id) } });
    if (!shuttle) {
      return res.status(404).json({ message: "No shuttle is assigned to this driver." });
    }

    const accuracyMeters = accuracy === null ? null : Number(accuracy);
    if (accuracyMeters !== null && (!Number.isFinite(accuracyMeters) || accuracyMeters < 0)) return res.status(400).json({ message: "Invalid GPS accuracy." });
    const recordedAt = timestamp ? new Date(timestamp) : new Date();
    if (Number.isNaN(recordedAt.getTime())) return res.status(400).json({ message: "Invalid GPS timestamp." });

    const location = await prisma.$transaction(async (tx) => {
      const createdLocation = await tx.shuttleLocation.create({
        data: {
          shuttleId: shuttle.id,
          latitude: lat,
          longitude: lon,
          placeName: place_name,
          speedKmh: speed_kmh === null ? null : Number(speed_kmh),
          accuracyMeters,
          recordedAt,
        },
      });
      await tx.shuttle.update({ where: { id: shuttle.id }, data: { status: "active" } });
      return createdLocation;
    });

    res.status(201).json({
      message: "Location recorded.",
      location: { ...location, id: Number(location.id), shuttle_id: location.shuttleId, place_name: location.placeName, speed_kmh: location.speedKmh, accuracy: location.accuracyMeters, recorded_at: location.recordedAt }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not save shuttle location." });
  }
});

/**
 * @swagger
 * /api/locations/{shuttleId}/history:
 *   get:
 *     tags: [Locations]
 *     summary: Get recent location history for a shuttle
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: shuttleId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Location history, content: { application/json: { schema: { type: object, properties: { locations: { type: array, items: { type: object } } } } } } }
 */
router.get("/:shuttleId/history", protect, async (req, res) => {
  try {
    const locations = await prisma.shuttleLocation.findMany({
      where: { shuttleId: Number(req.params.shuttleId) },
      orderBy: { recordedAt: "desc" },
      take: 100,
    });
    res.json({ locations: locations.map((location) => ({
      id: Number(location.id),
      latitude: location.latitude,
      longitude: location.longitude,
      place_name: location.placeName,
      speed_kmh: location.speedKmh,
      accuracy: location.accuracyMeters,
      recorded_at: location.recordedAt,
    })) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load location history." });
  }
});

module.exports = router;
