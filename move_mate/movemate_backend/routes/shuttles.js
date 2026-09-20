const express = require("express");
const prisma = require("../database");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

function serializeShuttle(shuttle) {
  const location = shuttle.locations?.[0];
  return {
    id: shuttle.id,
    name: shuttle.name,
    plate_number: shuttle.plateNumber,
    status: shuttle.status,
    current_route_id: shuttle.currentRouteId,
    route_name: shuttle.currentRoute?.name || null,
    latitude: location?.latitude || null,
    longitude: location?.longitude || null,
    place_name: location?.placeName || null,
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
        locations: { orderBy: { recordedAt: "desc" }, take: 1 },
      },
    });

    res.json({ shuttles: shuttles.map(serializeShuttle) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load shuttles." });
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
        locations: { orderBy: { recordedAt: "desc" }, take: 1 },
      },
    });

    if (!shuttle) {
      return res.status(404).json({ message: "Shuttle not found." });
    }

    const serialized = serializeShuttle(shuttle);
    serialized.route_id = shuttle.currentRoute?.id || null;
    res.json({ shuttle: serialized });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load shuttle." });
  }
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
