const express = require("express");
const prisma = require("../database");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

/**
 * @swagger
 * /api/routes:
 *   get:
 *     tags: [Routes]
 *     summary: List shuttle routes
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Route list }
 */
router.get("/", protect, async (req, res) => {
  try {
    const routes = await prisma.shuttleRoute.findMany({ orderBy: { id: "asc" } });
    res.json({ routes: routes.map((route) => ({
      ...route,
      start_location: route.startLocation,
      end_location: route.endLocation,
      created_at: route.createdAt,
    })) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load routes." });
  }
});

/**
 * @swagger
 * /api/routes/{id}/stops:
 *   get:
 *     tags: [Routes]
 *     summary: List stops for a route
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Route stops }
 */
router.get("/:id/stops", protect, async (req, res) => {
  try {
    const routeStops = await prisma.routeStop.findMany({
      where: { routeId: Number(req.params.id) },
      orderBy: { stopOrder: "asc" },
      include: { stop: true },
    });
    res.json({ stops: routeStops.map(({ stopOrder, stop }) => ({
      stop_order: stopOrder,
      id: stop.id,
      name: stop.name,
      latitude: stop.latitude,
      longitude: stop.longitude,
    })) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load route stops." });
  }
});

router.post("/:id/stops", protect, authorize("admin", "representative"), async (req, res) => {
  try {
    const { name, latitude, longitude, stop_order } = req.body;
    if (!name || latitude === undefined || longitude === undefined || !stop_order) {
      return res.status(400).json({ message: "name, latitude, longitude and stop_order are required." });
    }
    const stop = await prisma.stop.create({
      data: { name, latitude: Number(latitude), longitude: Number(longitude) },
    });
    const routeStop = await prisma.routeStop.create({
      data: { routeId: Number(req.params.id), stopId: stop.id, stopOrder: Number(stop_order) },
      include: { stop: true },
    });
    res.status(201).json({ stop: { ...routeStop.stop, stop_order: routeStop.stopOrder } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not add route stop." });
  }
});

/**
 * @swagger
 * /api/routes:
 *   post:
 *     tags: [Routes]
 *     summary: Create a shuttle route
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
 *               description: { type: string }
 *               start_location: { type: string }
 *               end_location: { type: string }
 *     responses:
 *       201: { description: Route created }
 */
router.post("/", protect, authorize("admin", "representative"), async (req, res) => {
  try {
    const { name, description, start_location, end_location } = req.body;

    if (!name) return res.status(400).json({ message: "Route name is required." });

    const route = await prisma.shuttleRoute.create({
      data: { name, description: description || null, startLocation: start_location || null, endLocation: end_location || null },
    });
    res.status(201).json({ route: {
      ...route,
      start_location: route.startLocation,
      end_location: route.endLocation,
      created_at: route.createdAt,
    } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not create route." });
  }
});

module.exports = router;
