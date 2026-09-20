const express = require("express");
const prisma = require("../database");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

/**
 * @swagger
 * /api/locations:
 *   post:
 *     tags: [Locations]
 *     summary: Record a shuttle GPS location
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [shuttle_id, latitude, longitude]
 *             properties:
 *               shuttle_id: { type: integer }
 *               latitude: { type: number, format: double, minimum: -90, maximum: 90 }
 *               longitude: { type: number, format: double, minimum: -180, maximum: 180 }
 *               place_name: { type: string }
 *               speed_kmh: { type: number, format: double }
 *     responses:
 *       201: { description: Location recorded }
 *       400: { description: Invalid coordinates }
 *       404: { description: Shuttle not found }
 */
router.post("/", protect, authorize("driver", "admin"), async (req, res) => {
  try {
    const { shuttle_id, latitude, longitude, place_name = null, speed_kmh = null } = req.body;

    if (!shuttle_id || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        message: "shuttle_id, latitude and longitude are required."
      });
    }

    const lat = Number(latitude);
    const lon = Number(longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res.status(400).json({ message: "Invalid GPS coordinates." });
    }

    const shuttleId = Number(shuttle_id);
    const shuttle = await prisma.shuttle.findUnique({ where: { id: shuttleId } });
    if (!shuttle) {
      return res.status(404).json({ message: "Shuttle not found." });
    }

    const location = await prisma.$transaction(async (tx) => {
      const createdLocation = await tx.shuttleLocation.create({
        data: {
          shuttleId,
          latitude: lat,
          longitude: lon,
          placeName: place_name,
          speedKmh: speed_kmh === null ? null : Number(speed_kmh),
        },
      });
      await tx.shuttle.update({ where: { id: shuttleId }, data: { status: "active" } });
      return createdLocation;
    });

    res.status(201).json({
      message: "Location recorded.",
      location: { ...location, id: Number(location.id), shuttle_id: location.shuttleId, place_name: location.placeName, speed_kmh: location.speedKmh, recorded_at: location.recordedAt }
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
      recorded_at: location.recordedAt,
    })) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load location history." });
  }
});

module.exports = router;
