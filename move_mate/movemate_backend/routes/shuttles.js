const express = require("express");
const pool = require("../database");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        s.id,
        s.name,
        s.plate_number,
        s.status,
        s.current_route_id,
        sr.name AS route_name,
        sl.latitude,
        sl.longitude,
        sl.place_name,
        sl.recorded_at
      FROM shuttles s
      LEFT JOIN shuttle_routes sr ON sr.id = s.current_route_id
      LEFT JOIN LATERAL (
        SELECT latitude, longitude, place_name, recorded_at
        FROM shuttle_locations
        WHERE shuttle_id = s.id
        ORDER BY recorded_at DESC
        LIMIT 1
      ) sl ON true
      ORDER BY s.id
    `);

    res.json({ shuttles: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load shuttles." });
  }
});

router.get("/:id", protect, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        s.id, s.name, s.plate_number, s.status,
        sr.id AS route_id, sr.name AS route_name,
        sl.latitude, sl.longitude, sl.place_name, sl.recorded_at
      FROM shuttles s
      LEFT JOIN shuttle_routes sr ON sr.id = s.current_route_id
      LEFT JOIN LATERAL (
        SELECT latitude, longitude, place_name, recorded_at
        FROM shuttle_locations
        WHERE shuttle_id = s.id
        ORDER BY recorded_at DESC
        LIMIT 1
      ) sl ON true
      WHERE s.id = $1
    `, [req.params.id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Shuttle not found." });
    }

    res.json({ shuttle: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load shuttle." });
  }
});

router.post("/", protect, authorize("admin", "representative"), async (req, res) => {
  try {
    const { name, plate_number, status = "active", current_route_id = null } = req.body;

    if (!name) return res.status(400).json({ message: "Shuttle name is required." });

    const result = await pool.query(
      `INSERT INTO shuttles (name, plate_number, status, current_route_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, plate_number || null, status, current_route_id]
    );

    res.status(201).json({ shuttle: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not create shuttle." });
  }
});

router.patch("/:id/status", protect, authorize("driver", "representative", "admin"), async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["active", "inactive", "maintenance"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid shuttle status." });
    }

    const result = await pool.query(
      "UPDATE shuttles SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      [status, req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Shuttle not found." });
    }

    res.json({ shuttle: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not update shuttle status." });
  }
});

module.exports = router;
